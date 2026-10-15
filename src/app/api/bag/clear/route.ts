import { cookies } from "next/headers";

import { writeBag } from "@/lib/bag";
import { CHECKOUT_COOKIE } from "@/lib/orders";

// POST /api/bag/clear: empties the bag after a successful checkout. The success page calls it
// (BagClear) because RSCs can't set cookies. Clearing a bag is harmless, so it needs no proof.
export async function POST() {
  await writeBag([]);
  (await cookies()).delete(CHECKOUT_COOKIE);
  return new Response(null, { status: 204 });
}
