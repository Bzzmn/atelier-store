"use client";

import { useActionState } from "react";

import { startCheckout } from "@/app/checkout/actions";
import { initialCheckoutState } from "@/app/checkout/state";

type CheckoutFormProps = {
  /** What the page showed, so the server can tell if the bag changed since. Never charged. */
  subtotal: number;
  count: number;
};

// A server action, so it works before hydration too. On success it redirects to Stripe.
export function CheckoutForm({ subtotal, count }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(startCheckout, initialCheckoutState);
  const empty = count === 0;
  const blocked = pending || empty;

  return (
    <form action={formAction} aria-busy={pending || undefined} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="subtotal" value={subtotal} />
      <input type="hidden" name="count" value={count} />
      {/* aria-disabled rather than disabled, so focus stays on the button while pending. */}
      <button
        type="submit"
        aria-disabled={blocked || undefined}
        aria-describedby={empty ? "checkout-hint" : undefined}
        onClick={(event) => blocked && event.preventDefault()}
        className="btn btn-primary w-full aria-disabled:opacity-40"
      >
        {pending ? "Starting checkout…" : "Checkout"}
      </button>
      {empty && (
        <p id="checkout-hint" className="type-body-sm text-center text-fg-muted">
          Nothing in your bag is available right now.
        </p>
      )}
      <p role="status" className="type-body-sm text-center text-error empty:hidden">
        {state.error}
      </p>
    </form>
  );
}
