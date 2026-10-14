import { describe, expect, it } from "vitest";

import { MAX_BAG_LINES, MAX_LINE_QUANTITY } from "@/lib/bag-cookie";
import { applyAdd, applyUpdate, normalizeBag, reconcile } from "@/lib/bag-reconcile";

const stock = (entries: Record<string, number>) => new Map(Object.entries(entries));

describe("applyAdd", () => {
  it("adds a new line", () => {
    const { lines, change } = applyAdd([], "a", 1, stock({ a: 5 }));
    expect(lines).toEqual([{ slug: "a", quantity: 1 }]);
    expect(change).toEqual({ status: "added", quantity: 1 });
  });

  it("increments an existing line in place", () => {
    const { lines } = applyAdd(
      [{ slug: "a", quantity: 1 }, { slug: "b", quantity: 1 }],
      "a",
      2,
      stock({ a: 5, b: 5 }),
    );
    expect(lines).toEqual([{ slug: "a", quantity: 3 }, { slug: "b", quantity: 1 }]);
  });

  it("clamps to stock", () => {
    const { lines, change } = applyAdd([{ slug: "a", quantity: 2 }], "a", 5, stock({ a: 3 }));
    expect(lines).toEqual([{ slug: "a", quantity: 3 }]);
    expect(change).toEqual({ status: "limited", quantity: 3 });
  });

  it("reports when the bag already holds all available stock", () => {
    const { lines, change } = applyAdd([{ slug: "a", quantity: 3 }], "a", 1, stock({ a: 3 }));
    expect(lines).toEqual([{ slug: "a", quantity: 3 }]);
    expect(change).toEqual({ status: "at_limit", quantity: 3 });
  });

  it("brings a line over stock back down rather than adding", () => {
    const { lines, change } = applyAdd([{ slug: "a", quantity: 5 }], "a", 1, stock({ a: 2 }));
    expect(lines).toEqual([{ slug: "a", quantity: 2 }]);
    expect(change.status).toBe("at_limit");
  });

  it("caps at the per-line maximum", () => {
    const { change } = applyAdd([], "a", 500, stock({ a: 1000 }));
    expect(change).toEqual({ status: "limited", quantity: MAX_LINE_QUANTITY });
  });

  it("rejects sold-out and unknown products without changing the bag", () => {
    const bag = [{ slug: "b", quantity: 1 }];
    expect(applyAdd(bag, "a", 1, stock({ a: 0, b: 1 }))).toEqual({ lines: bag, change: { status: "sold_out" } });
    expect(applyAdd(bag, "x", 1, stock({ b: 1 }))).toEqual({ lines: bag, change: { status: "unavailable" } });
  });

  it("refuses a new line when the bag is full", () => {
    const bag = Array.from({ length: MAX_BAG_LINES }, (_, i) => ({ slug: `p-${i}`, quantity: 1 }));
    expect(applyAdd(bag, "new", 1, stock({ new: 5 })).change).toEqual({ status: "bag_full" });
  });
});

describe("applyUpdate", () => {
  const bag = [{ slug: "a", quantity: 2 }, { slug: "b", quantity: 1 }];

  it("sets the quantity", () => {
    expect(applyUpdate(bag, "a", 3, stock({ a: 5 }))).toEqual({
      lines: [{ slug: "a", quantity: 3 }, { slug: "b", quantity: 1 }],
      change: { status: "updated", quantity: 3 },
    });
  });

  it("clamps to stock", () => {
    expect(applyUpdate(bag, "a", 9, stock({ a: 4 })).change).toEqual({ status: "limited", quantity: 4 });
  });

  it("removes at zero or below", () => {
    expect(applyUpdate(bag, "a", 0, stock({ a: 5 })).lines).toEqual([{ slug: "b", quantity: 1 }]);
    expect(applyUpdate(bag, "a", -3, stock({ a: 5 })).change).toEqual({ status: "removed" });
  });

  it("removes sold-out and unknown products", () => {
    expect(applyUpdate(bag, "a", 1, stock({ a: 0 }))).toEqual({
      lines: [{ slug: "b", quantity: 1 }],
      change: { status: "sold_out" },
    });
    expect(applyUpdate(bag, "a", 1, stock({})).change).toEqual({ status: "unavailable" });
  });

  it("ignores slugs that aren't in the bag", () => {
    expect(applyUpdate(bag, "z", 2, stock({ z: 5 }))).toEqual({ lines: bag, change: { status: "not_in_bag" } });
  });
});

describe("normalizeBag", () => {
  it("drops unknown products, clamps to stock and keeps sold-out lines", () => {
    const bag = [
      { slug: "a", quantity: 5 },
      { slug: "gone", quantity: 1 },
      { slug: "sold", quantity: 2 },
      { slug: "ok", quantity: 1 },
    ];
    expect(normalizeBag(bag, stock({ a: 3, sold: 0, ok: 9 }))).toEqual([
      { slug: "a", quantity: 3 },
      { slug: "sold", quantity: 2 },
      { slug: "ok", quantity: 1 },
    ]);
  });
});

describe("reconcile", () => {
  const product = (slug: string, price: number, stock: number) => ({ slug, price, stock });

  it("prices lines from current products and sums the subtotal", () => {
    const products = new Map([
      ["a", product("a", 12_000, 10)],
      ["b", product("b", 4_500, 10)],
    ]);
    const bag = reconcile([{ slug: "a", quantity: 2 }, { slug: "b", quantity: 1 }], products);
    expect(bag.lines.map((line) => line.lineTotal)).toEqual([24_000, 4_500]);
    expect(bag.subtotal).toBe(28_500);
    expect(bag.count).toBe(3);
    expect(bag.removedCount).toBe(0);
  });

  it("clamps lines over stock and flags them", () => {
    const bag = reconcile([{ slug: "a", quantity: 3 }], new Map([["a", product("a", 1_000, 1)]]));
    expect(bag.lines[0]).toMatchObject({ requested: 3, quantity: 1, max: 1, adjusted: true, soldOut: false });
    expect(bag.subtotal).toBe(1_000);
  });

  it("keeps sold-out lines but leaves them out of the subtotal and count", () => {
    const bag = reconcile(
      [{ slug: "a", quantity: 2 }, { slug: "b", quantity: 1 }],
      new Map([
        ["a", product("a", 1_000, 0)],
        ["b", product("b", 500, 3)],
      ]),
    );
    expect(bag.lines[0]).toMatchObject({ quantity: 0, soldOut: true, adjusted: false, lineTotal: 0 });
    expect(bag.subtotal).toBe(500);
    expect(bag.count).toBe(1);
  });

  it("hides products that no longer exist and counts them", () => {
    const bag = reconcile([{ slug: "gone", quantity: 1 }], new Map());
    expect(bag.lines).toEqual([]);
    expect(bag.removedCount).toBe(1);
    expect(bag.subtotal).toBe(0);
  });
});
