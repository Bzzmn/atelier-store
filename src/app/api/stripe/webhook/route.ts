import { beginEvent, finishEvent, fulfillFromSession, releaseFromSession } from "@/lib/orders";
import { getStripe, type Stripe } from "@/lib/stripe";

// POST /api/stripe/webhook: the source of truth for payment outcomes. Subscribe the endpoint
// to the checkout.session.* events handled below. Each handler is a conditional status
// change, so redelivered, retried or out-of-order events are no-ops.

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      // Re-fetched rather than read from the payload: the payload's shape follows the
      // endpoint's API version (e.g. `stripe listen` uses an old one without
      // collected_information), and the fetched session is current.
      await fulfillFromSession(await getStripe().checkout.sessions.retrieve(event.data.object.id));
      break;
    case "checkout.session.async_payment_failed":
      await releaseFromSession(event.data.object, "fail");
      break;
    case "checkout.session.expired":
      await releaseFromSession(event.data.object, "expire");
      break;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response(null, { status: 500 });
  }

  // The signature covers the exact bytes Stripe sent, so read the raw body.
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (await beginEvent(event)) {
      await handle(event);
      await finishEvent(event.id);
    }
    return new Response(null, { status: 200 });
  } catch (error) {
    // A non-2xx makes Stripe retry with backoff.
    console.error("Stripe webhook failed", { eventId: event.id, type: event.type, error });
    return new Response(null, { status: 500 });
  }
}
