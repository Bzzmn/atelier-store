import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/db/schema/orders";
import { reconcile } from "@/lib/bag-reconcile";
import {
  completedSessionAction,
  isCheckoutSessionId,
  nextStatus,
  type OrderAction,
  orderTotal,
  type SessionFacts,
  toOrderLines,
} from "@/lib/checkout-rules";

const product = (slug: string, price: number, stock: number, id = slug.length) => ({
  id,
  slug,
  name: slug.toUpperCase(),
  price,
  stock,
});

describe("toOrderLines", () => {
  const products = new Map([
    ["coat", product("coat", 50_000, 2, 1)],
    ["scarf", product("scarf", 9_000, 0, 2)],
  ]);

  it("charges database prices for buyable quantities only", () => {
    // A tampered cookie: 99 coats, a sold-out scarf and a product that doesn't exist.
    const bag = reconcile(
      [
        { slug: "coat", quantity: 99 },
        { slug: "scarf", quantity: 1 },
        { slug: "made-up", quantity: 5 },
      ],
      products,
    );
    const lines = toOrderLines(bag.lines);
    expect(lines).toEqual([
      { productId: 1, slug: "coat", name: "COAT", unitPrice: 50_000, quantity: 2, image: undefined },
    ]);
    expect(orderTotal(lines)).toBe(100_000);
    expect(orderTotal(lines)).toBe(bag.subtotal);
  });

  it("is empty when everything is sold out", () => {
    expect(toOrderLines(reconcile([{ slug: "scarf", quantity: 1 }], products).lines)).toEqual([]);
  });
});

describe("nextStatus", () => {
  const statuses: OrderStatus[] = ["pending", "processing", "paid", "failed", "expired", "canceled", "needs_review"];
  const expected: Record<OrderAction, Partial<Record<OrderStatus, OrderStatus>>> = {
    pay: { pending: "paid", processing: "paid" },
    process: { pending: "processing" },
    fail: { pending: "failed", processing: "failed" },
    expire: { pending: "expired" },
    cancel: { pending: "canceled" },
    review: { pending: "needs_review", processing: "needs_review" },
  };

  for (const [action, moves] of Object.entries(expected) as [OrderAction, typeof expected.pay][]) {
    it(`${action} applies only from ${Object.keys(moves).join(" or ")}`, () => {
      for (const status of statuses) expect(nextStatus(status, action)).toBe(moves[status]);
    });
  }

  it("never leaves a paid order", () => {
    for (const action of Object.keys(expected) as OrderAction[]) {
      expect(nextStatus("paid", action) ?? "paid").toBe("paid");
    }
  });
});

describe("completedSessionAction", () => {
  const order = { stripeCheckoutSessionId: "cs_test_1", total: 100_000, currency: "usd" };
  const session = (facts: Partial<SessionFacts> = {}): SessionFacts => ({
    id: "cs_test_1",
    status: "complete",
    payment_status: "paid",
    amount_total: 100_000,
    currency: "usd",
    ...facts,
  });

  it("pays a matching paid session", () => {
    expect(completedSessionAction(session(), order)).toBe("pay");
  });

  it("waits for delayed payment methods", () => {
    expect(completedSessionAction(session({ payment_status: "unpaid" }), order)).toBe("process");
  });

  it("does nothing while the session is open or expired", () => {
    expect(completedSessionAction(session({ status: "open", payment_status: "unpaid" }), order)).toBeUndefined();
    expect(completedSessionAction(session({ status: "expired", payment_status: "unpaid" }), order)).toBeUndefined();
  });

  it("ignores sessions that aren't the order's", () => {
    expect(completedSessionAction(session({ id: "cs_test_other" }), order)).toBeUndefined();
    expect(completedSessionAction(session(), { ...order, stripeCheckoutSessionId: null })).toBeUndefined();
  });

  it("flags a different amount or currency for review instead of paying", () => {
    expect(completedSessionAction(session({ amount_total: 1 }), order)).toBe("review");
    expect(completedSessionAction(session({ amount_total: null }), order)).toBe("review");
    expect(completedSessionAction(session({ currency: "eur" }), order)).toBe("review");
  });
});

describe("isCheckoutSessionId", () => {
  it("accepts Stripe Checkout Session ids only", () => {
    expect(isCheckoutSessionId("cs_test_a15G5DDBExjBbIkB")).toBe(true);
    expect(isCheckoutSessionId("cs_live_a1b2")).toBe(true);
    for (const value of ["", "cs_test_", "pi_test_123", "cs_test_a1'--", "cs_test_a1/../x", undefined, ["cs_test_a1"]]) {
      expect(isCheckoutSessionId(value)).toBe(false);
    }
  });
});
