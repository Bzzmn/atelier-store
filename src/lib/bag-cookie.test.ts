import { describe, expect, it } from "vitest";

import { bagCount, MAX_BAG_LINES, MAX_LINE_QUANTITY, parseBag, serializeBag } from "@/lib/bag-cookie";

describe("parseBag", () => {
  it("treats a missing or malformed cookie as an empty bag", () => {
    expect(parseBag(undefined)).toEqual([]);
    expect(parseBag("")).toEqual([]);
    expect(parseBag("{not json")).toEqual([]);
    expect(parseBag('{"slug":"a"}')).toEqual([]);
  });

  it("round-trips through serializeBag", () => {
    const lines = [
      { slug: "linen-shirt", quantity: 2 },
      { slug: "wool-coat", quantity: 1 },
    ];
    expect(parseBag(serializeBag(lines))).toEqual(lines);
  });

  it("skips malformed lines and keeps the first of duplicate slugs", () => {
    const raw = JSON.stringify([
      ["ok", 1],
      ["Bad Slug", 1],
      ["../etc", 1],
      ["zero", 0],
      ["neg", -2],
      ["frac", 1.5],
      ["str", "2"],
      "nope",
      ["ok", 5],
    ]);
    expect(parseBag(raw)).toEqual([{ slug: "ok", quantity: 1 }]);
  });

  it("caps quantity per line and the number of lines", () => {
    expect(parseBag(JSON.stringify([["a", 999]]))).toEqual([{ slug: "a", quantity: MAX_LINE_QUANTITY }]);
    const many = Array.from({ length: MAX_BAG_LINES + 10 }, (_, i) => [`p-${i}`, 1]);
    expect(parseBag(JSON.stringify(many))).toHaveLength(MAX_BAG_LINES);
  });
});

describe("bagCount", () => {
  it("sums quantities", () => {
    expect(bagCount([])).toBe(0);
    expect(bagCount([{ slug: "a", quantity: 2 }, { slug: "b", quantity: 3 }])).toBe(5);
  });
});
