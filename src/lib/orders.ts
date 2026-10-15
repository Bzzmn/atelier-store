import "server-only";

import { and, asc, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  orderItems,
  orders,
  type OrderStatus,
  productImages,
  type ShippingAddress,
  stripeEvents,
} from "@/db/schema";
import {
  CHECKOUT_TTL_MS,
  completedSessionAction,
  CUSTOMER_ORDER_STATUSES,
  type OrderAction,
  type OrderLine,
  ORDER_CURRENCY,
  ORDER_TRANSITIONS,
  orderTotal,
} from "@/lib/checkout-rules";
import { getStripe, type Stripe } from "@/lib/stripe";

// Orders are written only here. Every status change goes through transition(), which applies
// only from the statuses ORDER_TRANSITIONS allows, so webhooks, checkout cancellation and the
// sweeper can all race or repeat without double-charging stock or regressing an order.

export type Order = typeof orders.$inferSelect;

/** httpOnly cookie with the visitor's latest pending order id. */
export const CHECKOUT_COOKIE = "checkout_order";

export function isOrderId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}

/** Units a pending order still holds, by slug. Empty once the order moved on. */
export async function getHeldStock(orderId: string) {
  const rows = await db
    .select({ slug: orderItems.slug, quantity: orderItems.quantity })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending"), eq(orders.stockReleased, false)));
  return new Map(rows.map((row) => [row.slug, row.quantity]));
}

export async function getOrderItems(orderId: string) {
  return db
    .select({ slug: orderItems.slug, name: orderItems.name, unitPrice: orderItems.unitPrice, quantity: orderItems.quantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.id);
}

export class OutOfStockError extends Error {}

/** True for Postgres CHECK violations (SQLSTATE 23514), however the driver wraps them. */
function isCheckViolation(error: unknown): boolean {
  for (let e = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: unknown }).code === "23514") return true;
  }
  return false;
}

/**
 * Creates a pending order and reserves its stock in one transaction. Throws OutOfStockError
 * when any line would take a product below zero (the products_stock_nonnegative check), in
 * which case nothing is written.
 */
export async function createPendingOrder(lines: OrderLine[], userId: string | null): Promise<Order> {
  if (lines.length === 0) throw new Error("An order needs at least one line");
  const id = crypto.randomUUID();
  const total = orderTotal(lines);
  const reserved = sql.join(
    lines.map((line) => sql`(${line.productId}::int, ${line.quantity}::int)`),
    sql`, `,
  );

  try {
    const [[order]] = await db.batch([
      db
        .insert(orders)
        .values({
          id,
          userId,
          currency: ORDER_CURRENCY,
          subtotal: total,
          total,
          expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
        })
        .returning(),
      db.insert(orderItems).values(
        lines.map(({ productId, slug, name, unitPrice, quantity }) => ({
          orderId: id,
          productId,
          slug,
          name,
          unitPrice,
          quantity,
        })),
      ),
      db.execute(sql`
        update products set stock = products.stock - reserved.quantity, updated_at = now()
        from (values ${reserved}) as reserved(product_id, quantity)
        where products.id = reserved.product_id`),
    ]);
    return order;
  } catch (error) {
    if (isCheckViolation(error)) throw new OutOfStockError("Not enough stock", { cause: error });
    throw error;
  }
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  await db.update(orders).set({ stripeCheckoutSessionId: sessionId }).where(eq(orders.id, orderId));
}

export async function getOrder(orderId: string) {
  return db.query.orders.findFirst({ where: eq(orders.id, orderId) });
}

const itemsInOrder = {
  columns: { slug: true as const, name: true as const, unitPrice: true as const, quantity: true as const },
  orderBy: [asc(orderItems.id)],
};

/**
 * A customer's completed orders, newest first. Scoped by the account id only: guest orders
 * that used the same email aren't linked to the account.
 */
export async function getCustomerOrders(userId: string, limit = 50) {
  return db.query.orders.findMany({
    where: and(eq(orders.userId, userId), inArray(orders.status, [...CUSTOMER_ORDER_STATUSES])),
    columns: { id: true, status: true, total: true, createdAt: true },
    with: { items: itemsInOrder },
    orderBy: [desc(orders.createdAt), desc(orders.id)],
    limit,
  });
}

/**
 * One of the customer's orders, or undefined if it isn't theirs (or isn't a completed order).
 * Ownership is part of the query itself, and only the fields the customer sees are loaded.
 */
export async function getCustomerOrder(userId: string, orderId: string) {
  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      eq(orders.userId, userId),
      inArray(orders.status, [...CUSTOMER_ORDER_STATUSES]),
    ),
    columns: { id: true, status: true, total: true, email: true, shippingAddress: true, createdAt: true, paidAt: true },
    with: {
      items: {
        ...itemsInOrder,
        // The product's current card shot; items keep their own name and price snapshot.
        with: {
          product: {
            columns: { id: true },
            with: { images: { columns: { src: true, alt: true }, where: eq(productImages.position, 0) } },
          },
        },
      },
    },
  });
  if (!order) return undefined;
  return {
    ...order,
    items: order.items.map(({ product, ...item }) => ({ ...item, image: product.images[0] })),
  };
}

export const ADMIN_ORDERS_PAGE_SIZE = 50;
/** Deepest page the admin list serves; keeps OFFSET small. */
export const MAX_ADMIN_ORDERS_PAGE = 1000;

/**
 * Every order for the admin list, newest first, optionally of one status. Returns one page of
 * ADMIN_ORDERS_PAGE_SIZE and the total match count. Callers check requireAdmin() first.
 */
export async function getAdminOrders({
  status,
  page = 1,
  limit = ADMIN_ORDERS_PAGE_SIZE,
}: { status?: OrderStatus; page?: number; limit?: number } = {}) {
  const rows = await db.query.orders.findMany({
    where: status ? eq(orders.status, status) : undefined,
    columns: { id: true, status: true, email: true, total: true, createdAt: true },
    with: { items: { columns: { quantity: true } } },
    extras: { matches: sql<string>`count(*) over ()`.as("matches") },
    orderBy: [desc(orders.createdAt), desc(orders.id)],
    limit,
    offset: (Math.min(page, MAX_ADMIN_ORDERS_PAGE) - 1) * limit,
  });
  return {
    orders: rows.map((row) => ({
      id: row.id,
      status: row.status,
      email: row.email,
      total: row.total,
      createdAt: row.createdAt,
      pieces: row.items.reduce((total, item) => total + item.quantity, 0),
    })),
    total: Number(rows[0]?.matches ?? 0),
  };
}

/** Any order with all its fields and items, for the admin detail page. Callers check requireAdmin() first. */
export async function getAdminOrder(orderId: string) {
  if (!isOrderId(orderId)) return undefined;
  return db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: itemsInOrder },
  });
}

/** The order a Checkout Session belongs to, as the webhook last left it. Read-only. */
export async function getOrderBySessionId(sessionId: string) {
  return db.query.orders.findFirst({ where: eq(orders.stripeCheckoutSessionId, sessionId) });
}

/**
 * Applies `action` if the order is in one of its allowed statuses. Restocking actions return
 * the reserved units in the same statement, at most once per order. Returns whether the
 * order changed.
 */
export async function transition(
  orderId: string,
  action: OrderAction,
  fields: Partial<Pick<Order, "email" | "shippingAddress" | "stripePaymentIntentId" | "paidAt">> = {},
): Promise<boolean> {
  const { from, to, restock } = ORDER_TRANSITIONS[action];

  if (!restock) {
    const rows = await db
      .update(orders)
      .set({ ...fields, status: to })
      .where(and(eq(orders.id, orderId), inArray(orders.status, [...from])))
      .returning({ id: orders.id });
    return rows.length > 0;
  }

  // Both updates in one statement: the order moves and its stock comes back together, or not at all.
  const fromList = sql.join(from.map((status) => sql`${status}`), sql`, `);
  const result = await db.execute<{ id: string }>(sql`
    with moved as (
      update orders set status = ${to}, stock_released = true, updated_at = now()
      where id = ${orderId} and status in (${fromList}) and not stock_released
      returning id
    ), restocked as (
      update products set stock = products.stock + order_items.quantity, updated_at = now()
      from order_items join moved on order_items.order_id = moved.id
      where products.id = order_items.product_id
    )
    select id from moved`);
  return result.rows.length > 0;
}

function shippingAddressFrom(session: Stripe.Checkout.Session): ShippingAddress | null {
  const shipping = session.collected_information?.shipping_details;
  if (!shipping) return null;
  const { address } = shipping;
  return {
    name: shipping.name,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
}

function orderIdFrom(session: Stripe.Checkout.Session) {
  return session.metadata?.order_id ?? session.client_reference_id ?? undefined;
}

/**
 * Records the outcome of a completed Checkout Session: paid, processing (delayed payment
 * methods) or needs_review (amount mismatch). Safe to call any number of times, from the
 * webhook or the sweeper. Returns the order as it is afterwards, or undefined when the
 * session isn't one of ours.
 */
export async function fulfillFromSession(session: Stripe.Checkout.Session) {
  const orderId = orderIdFrom(session);
  const order = orderId && (await getOrder(orderId));
  if (!order) return undefined;

  const action = completedSessionAction(session, order);
  if (action === "review") {
    console.error("Checkout amount mismatch", {
      orderId: order.id,
      sessionId: session.id,
      expected: [order.total, order.currency],
      received: [session.amount_total, session.currency],
    });
    await transition(order.id, "review");
  } else if (action) {
    const paymentIntent = session.payment_intent;
    await transition(order.id, action, {
      email: session.customer_details?.email ?? null,
      shippingAddress: shippingAddressFrom(session),
      stripePaymentIntentId: typeof paymentIntent === "string" ? paymentIntent : (paymentIntent?.id ?? null),
      ...(action === "pay" && { paidAt: new Date() }),
    });
  }
  return getOrder(order.id);
}

/** Expired or failed sessions: returns the order's stock. No-op for orders that moved on. */
export async function releaseFromSession(session: Stripe.Checkout.Session, action: "expire" | "fail") {
  const orderId = orderIdFrom(session);
  const order = orderId && (await getOrder(orderId));
  if (!order || order.stripeCheckoutSessionId !== session.id) return false;
  return transition(order.id, action);
}

/**
 * Ends a pending checkout early, e.g. when the same visitor starts a new one, so its units
 * aren't held twice. If Stripe says the session already completed, it's fulfilled instead.
 */
export async function abandonCheckout(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") return;
  if (!order.stripeCheckoutSessionId) {
    await transition(order.id, "cancel");
    return;
  }
  await settleSession(order.stripeCheckoutSessionId);
}

/** Brings an order in line with its Checkout Session, expiring the session if still open. */
async function settleSession(sessionId: string) {
  const stripe = getStripe();
  let session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status === "open") {
    try {
      session = await stripe.checkout.sessions.expire(sessionId);
    } catch {
      // Completed between the two calls; read the final state.
      session = await stripe.checkout.sessions.retrieve(sessionId);
    }
  }
  if (session.status === "complete") await fulfillFromSession(session);
  else if (session.status === "expired") await releaseFromSession(session, "expire");
}

/** Orders whose sessions should have expired this long ago are settled by the sweeper. */
const SWEEP_GRACE_MS = 10 * 60 * 1000;

/**
 * Safety net for missed webhooks: settles pending orders past their expiry, oldest first.
 * Returns how many orders it looked at.
 */
export async function sweepStaleOrders(limit = 50) {
  const stale = await db
    .select({ id: orders.id, sessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.status, "pending"), lt(orders.expiresAt, new Date(Date.now() - SWEEP_GRACE_MS))))
    .orderBy(orders.expiresAt)
    .limit(limit);

  for (const order of stale) {
    try {
      if (order.sessionId) await settleSession(order.sessionId);
      else await transition(order.id, "cancel");
    } catch (error) {
      console.error("Order sweep failed", { orderId: order.id, error });
    }
  }
  return stale.length;
}

/**
 * Records a webhook event. Returns false if it was already processed, so the handler can
 * skip it. Events that were received but failed are processed again on Stripe's retry.
 */
export async function beginEvent(event: Stripe.Event) {
  await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  const [row] = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(and(eq(stripeEvents.id, event.id), isNull(stripeEvents.processedAt)));
  return row !== undefined;
}

export async function finishEvent(eventId: string) {
  await db.update(stripeEvents).set({ processedAt: new Date() }).where(eq(stripeEvents.id, eventId));
}
