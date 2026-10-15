// Lives outside actions.ts: a "use server" module may only export async functions.
// Success never returns: the action redirects to Stripe (or back to /bag).

export type CheckoutState = { error: string; id: number };

export const initialCheckoutState: CheckoutState = { error: "", id: 0 };
