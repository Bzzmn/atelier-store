import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { abandonCheckout, CHECKOUT_COOKIE, isOrderId } from "@/lib/orders";

// GET /checkout/cancel: Stripe's cancel_url. Releases the visitor's pending checkout right
// away (rather than when its session expires) so the pieces are buyable again, then shows
// the bag. Only the order in the visitor's own httpOnly cookie can be released.
export async function GET() {
  const store = await cookies();
  const orderId = store.get(CHECKOUT_COOKIE)?.value;
  if (isOrderId(orderId)) {
    try {
      await abandonCheckout(orderId);
      store.delete(CHECKOUT_COOKIE);
    } catch (error) {
      // The session still expires on its own, and the bag counts the visitor's held units.
      console.error("Couldn't release the canceled checkout", { orderId, error });
    }
  }
  redirect("/bag?notice=canceled");
}
