import { isCheckoutSessionId } from "@/lib/checkout-rules";
import { getOrderBySessionId } from "@/lib/orders";

// GET /api/orders/status?session_id=: the order's confirmed status, for the confirmation page
// to poll while payment is being confirmed. Read-only: only the Stripe webhook moves orders.
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const order = isCheckoutSessionId(sessionId) ? await getOrderBySessionId(sessionId) : undefined;
  if (!order) return Response.json({ status: null }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json({ status: order.status }, { headers: { "Cache-Control": "no-store" } });
}
