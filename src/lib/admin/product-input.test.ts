import { describe, expect, it } from "vitest";

import {
  isAllowedImageUrl,
  MAX_STOCK,
  parseCategoryForm,
  parseCount,
  parseDetails,
  parseId,
  parseNewProductForm,
  parsePrice,
  parseProductForm,
  parseStockForm,
  priceFieldValue,
} from "@/lib/admin/product-input";

const PHOTO = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200";

function form(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

const validProduct = {
  name: "Belted wool coat",
  description: "A wrap coat in double-faced wool.",
  details: "100% wool\n\n  Dry clean only  \n",
  price: "1290.50",
  color: "Camel",
  badge: "",
  gender: "women",
  categoryId: "3",
  imageSrc: [PHOTO, ""],
  imageAlt: ["Camel coat, front", ""],
};

describe("parsePrice", () => {
  it("converts dollars to cents", () => {
    expect(parsePrice("1290")).toBe(129_000);
    expect(parsePrice("12.5")).toBe(1250);
    expect(parsePrice("12.05")).toBe(1205);
    expect(parsePrice(" $0.99 ")).toBe(99);
    expect(parsePrice("0")).toBe(0);
  });

  it("rejects anything that isn't a plain dollar amount", () => {
    for (const value of ["", "-1", "1e3", "12.345", "1,290", "12.", ".5", "abc", "100000"]) {
      expect(parsePrice(value), value).toBeUndefined();
    }
    expect(parsePrice(null)).toBeUndefined();
  });

  it("round-trips through the field value", () => {
    expect(priceFieldValue(129_050)).toBe("1290.50");
    expect(parsePrice(priceFieldValue(129_050))).toBe(129_050);
  });
});

describe("parseCount / parseId", () => {
  it("accepts whole numbers in range", () => {
    expect(parseCount("0")).toBe(0);
    expect(parseCount(String(MAX_STOCK))).toBe(MAX_STOCK);
    expect(parseId("42")).toBe(42);
  });

  it("rejects the rest", () => {
    for (const value of ["", "-1", "1.5", "1e3", String(MAX_STOCK + 1), " "]) {
      expect(parseCount(value), value).toBeUndefined();
    }
    for (const value of ["0", "01", "-3", "1.0", "99999999999", "x"]) {
      expect(parseId(value), value).toBeUndefined();
    }
  });
});

describe("isAllowedImageUrl", () => {
  it("allows Unsplash photo URLs only", () => {
    expect(isAllowedImageUrl(PHOTO)).toBe(true);
    for (const value of [
      "http://images.unsplash.com/photo-1",
      "https://images.unsplash.com/profile-1",
      "https://images.unsplash.com.evil.com/photo-1",
      "https://user@images.unsplash.com/photo-1",
      "https://images.unsplash.com:8443/photo-1",
      "//images.unsplash.com/photo-1",
      "/photo-1",
      "javascript:alert(1)",
      "",
    ]) {
      expect(isAllowedImageUrl(value), value).toBe(false);
    }
  });
});

describe("parseDetails", () => {
  it("keeps one trimmed detail per non-empty line", () => {
    expect(parseDetails("a\r\n\n  b  \n")).toEqual(["a", "b"]);
  });
});

describe("parseProductForm", () => {
  it("parses a valid product", () => {
    const result = parseProductForm(form(validProduct));
    expect(result).toEqual({
      ok: true,
      value: {
        name: "Belted wool coat",
        description: "A wrap coat in double-faced wool.",
        details: ["100% wool", "Dry clean only"],
        price: 129_050,
        color: "Camel",
        badge: null,
        gender: "women",
        categoryId: 3,
        images: [{ src: PHOTO, alt: "Camel coat, front" }],
      },
    });
  });

  it("reports every invalid field", () => {
    const result = parseProductForm(
      form({
        ...validProduct,
        name: " ",
        price: "-5",
        gender: "kids",
        categoryId: "",
        imageSrc: ["https://example.com/a.jpg", PHOTO],
        imageAlt: ["", "Back"],
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["categoryId", "gender", "image.0.alt", "image.0.src", "name", "price"].sort(),
    );
  });

  it("requires at least one image and caps the count", () => {
    const none = parseProductForm(form({ ...validProduct, imageSrc: [""], imageAlt: [""] }));
    expect(none.ok || none.errors.images).toBe("Add at least one image.");

    const many = parseProductForm(
      form({ ...validProduct, imageSrc: Array(9).fill(PHOTO), imageAlt: Array(9).fill("Alt") }),
    );
    expect(many.ok).toBe(false);
  });

  it("limits details", () => {
    const result = parseProductForm(form({ ...validProduct, details: Array(13).fill("x").join("\n") }));
    expect(result.ok || result.errors.details).toMatch(/12 lines/);
  });
});

describe("parseNewProductForm", () => {
  it("adds slug and opening stock", () => {
    const result = parseNewProductForm(form({ ...validProduct, slug: "Belted-Wool-Coat", stock: "4" }));
    expect(result.ok && result.value).toMatchObject({ slug: "belted-wool-coat", stock: 4 });
  });

  it("rejects malformed slugs and stock", () => {
    for (const slug of ["", "-coat", "coat--wool", "coat wool", "café", "a".repeat(101)]) {
      const result = parseNewProductForm(form({ ...validProduct, slug, stock: "1" }));
      expect(result.ok || result.errors.slug, slug).toBeTruthy();
      expect(result.ok, slug).toBe(false);
    }
    const result = parseNewProductForm(form({ ...validProduct, slug: "coat", stock: "-1" }));
    expect(result.ok || result.errors.stock).toBeTruthy();
  });
});

describe("parseCategoryForm", () => {
  it("derives the slug from the name", () => {
    expect(parseCategoryForm(form({ name: " Ready-to-wear " }))).toEqual({
      ok: true,
      value: { name: "Ready-to-wear", slug: "ready-to-wear" },
    });
  });

  it("rejects empty, unsluggable and reserved names", () => {
    for (const name of ["", "!!!", "New", "WOMEN", "men", "x".repeat(61)]) {
      expect(parseCategoryForm(form({ name })).ok, name).toBe(false);
    }
  });
});

describe("parseStockForm", () => {
  it("parses the ids and counts", () => {
    expect(parseStockForm(form({ productId: "7", expected: "3", stock: "10" }))).toEqual({
      ok: true,
      value: { productId: 7, expected: 3, stock: 10 },
    });
  });

  it("separates a bad count from a tampered form", () => {
    const badStock = parseStockForm(form({ productId: "7", expected: "3", stock: "-2" }));
    expect(badStock.ok || badStock.errors.stock).toBeTruthy();
    const tampered = parseStockForm(form({ productId: "x", expected: "3", stock: "2" }));
    expect(tampered.ok || tampered.errors.form).toBeTruthy();
  });
});
