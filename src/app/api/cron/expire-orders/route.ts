import { timingSafeEqual } from "node:crypto";

import { sweepStaleOrders } from "@/lib/orders";

// GET /api/cron/expire-orders: settles pending orders whose expiry webhook never arrived and
// returns their stock. Run it every 15 minutes with `Authorization: Bearer $CRON_SECRET`
// (Vercel Cron sends this header when CRON_SECRET is set).

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return new Response(null, { status: 401 });
  const checked = await sweepStaleOrders();
  return Response.json({ checked });
}
