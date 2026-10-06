// Seed catalog for `pnpm db:seed`, moved from the original placeholder data.
// Photography: Unsplash (https://unsplash.com/license).

import type { ImageAsset } from "@/lib/catalog";
import { detail, unsplash } from "@/lib/unsplash";

export type SeedProduct = {
  slug: string;
  name: string;
  category: string; // category name; must match one in `seedCategories`
  price: number; // minor units (cents)
  image: ImageAsset; // primary shot, used on cards
  gallery: ImageAsset[]; // additional shots for the detail page
  badge?: string;
  color: string;
  description: string;
  details: string[];
  stock: number; // units available
};

export const seedCategories = [
  "Outerwear",
  "Knitwear",
  "Ready-to-wear",
  "Bags",
  "Shoes",
  "Jewelry",
  "Eyewear",
];

// Shown as New Arrivals on the homepage, so they're seeded as the newest products.
export const newArrivals: SeedProduct[] = [
  {
    slug: "lambskin-biker-jacket",
    name: "Lambskin biker jacket",
    category: "Outerwear",
    price: 289000,
    badge: "New",
    color: "Black",
    stock: 4,
    description:
      "A classic biker silhouette cut from supple lambskin, with an asymmetric zip front, notched lapels and snap-down collar. Softly structured through the shoulders to wear open or closed.",
    details: [
      "100% lambskin leather",
      "Cupro lining",
      "Asymmetric zip closure",
      "Three zip pockets",
      "Made in Italy",
    ],
    image: {
      src: unsplash("1551028719-00167b16eac5", 1600),
      alt: "Black leather biker jacket on a hanger",
    },
    gallery: [
      {
        src: detail("1551028719-00167b16eac5", 0.2, 0.7, 2.2),
        alt: "Close-up of the jacket's silver zips and pocket detail",
      },
      {
        src: detail("1551028719-00167b16eac5", 0.75, 0.6, 2),
        alt: "Sleeve and shoulder of the black leather jacket",
      },
    ],
  },
  {
    slug: "chevron-chain-shoulder-bag",
    name: "Chevron chain shoulder bag",
    category: "Bags",
    price: 168000,
    color: "Blush",
    stock: 2,
    description:
      "A compact flap bag in smooth calfskin, finished with a hand-painted chevron panel. The sliding chain strap can be worn long across the body or doubled on the shoulder.",
    details: [
      "Calfskin leather",
      "Palladium-finish chain strap",
      "Magnetic flap closure",
      "Interior slip pocket",
      "W 22 × H 14 × D 6 cm",
    ],
    image: {
      src: unsplash("1566150905458-1bf1fc113f0d", 1600),
      alt: "Pink leather shoulder bag with chevron panel and chain strap",
    },
    gallery: [
      {
        src: detail("1566150905458-1bf1fc113f0d", 0.55, 0.45, 2),
        alt: "Detail of the chevron panel in yellow and white",
      },
      {
        src: detail("1566150905458-1bf1fc113f0d", 0.7, 0.8, 2.5),
        alt: "Silver chain strap resting beside the bag",
      },
    ],
  },
  {
    slug: "open-knit-cotton-poncho",
    name: "Open-knit cotton poncho",
    category: "Knitwear",
    price: 98000,
    badge: "Limited",
    color: "Ecru",
    stock: 0,
    description:
      "An airy open-knit poncho in organic cotton, with a relaxed V-neck and hand-knotted fringe along the hem. Layer over knitwear or a slip dress.",
    details: [
      "100% organic cotton",
      "Hand-knotted fringe",
      "One size",
      "Hand wash cold",
    ],
    image: {
      src: unsplash("1434389677669-e08b4cac3105", 1600),
      alt: "Cream open-knit poncho with fringe on a wooden hanger",
    },
    gallery: [
      {
        src: detail("1434389677669-e08b4cac3105", 0.5, 0.45, 2.5),
        alt: "Close-up of the open-knit cotton texture",
      },
      {
        src: detail("1434389677669-e08b4cac3105", 0.5, 0.85, 2.5),
        alt: "Fringed hem of the poncho",
      },
    ],
  },
  {
    slug: "grained-leather-backpack",
    name: "Grained leather backpack",
    category: "Bags",
    price: 215000,
    color: "Cognac",
    stock: 12,
    description:
      "A structured backpack in vegetable-tanned grained leather that deepens in tone with wear. Padded laptop sleeve, two front zip pockets and adjustable shoulder straps.",
    details: [
      "Vegetable-tanned leather",
      "Cotton twill lining",
      "Padded 15-inch laptop sleeve",
      "Antique brass hardware",
      "W 30 × H 42 × D 14 cm",
    ],
    image: {
      src: unsplash("1622560480605-d83c853bc5c3", 1600),
      alt: "Cognac leather backpack against a white wall",
    },
    gallery: [
      {
        src: detail("1622560480605-d83c853bc5c3", 0.5, 0.35, 2.5),
        alt: "Top handle and stitched front panel of the backpack",
      },
      {
        src: detail("1622560480605-d83c853bc5c3", 0.5, 0.75, 2.2),
        alt: "Zip pocket on the front of the backpack",
      },
    ],
  },
  {
    slug: "panelled-runner-sneaker",
    name: "Panelled runner sneaker",
    category: "Shoes",
    price: 89000,
    badge: "New",
    color: "Multicolour",
    stock: 7,
    description:
      "A chunky runner built from suede, mesh and leather panels in a sun-washed palette, set on a sculpted lightweight sole.",
    details: [
      "Suede, mesh and calfskin upper",
      "Leather lining",
      "Rubber sole",
      "Contrast laces included",
      "Made in Portugal",
    ],
    image: {
      src: unsplash("1560769629-975ec94e6a86", 1600),
      alt: "Pair of multicolour panelled sneakers on a white plinth",
    },
    gallery: [
      {
        src: detail("1560769629-975ec94e6a86", 0.35, 0.35, 2.2),
        alt: "Side profile of the panelled sneaker",
      },
      {
        src: detail("1560769629-975ec94e6a86", 0.55, 0.7, 2.2),
        alt: "Sculpted sole and suede panels of the sneaker",
      },
    ],
  },
  {
    slug: "freshwater-pearl-necklace",
    name: "Freshwater pearl necklace",
    category: "Jewelry",
    price: 125000,
    color: "Pearl",
    stock: 3,
    description:
      "A single strand of hand-knotted freshwater pearls, graduated in size and closed with a crystal-set clasp.",
    details: [
      "7–8 mm freshwater pearls",
      "Sterling silver clasp with crystals",
      "Hand-knotted silk thread",
      "Length 45 cm",
    ],
    image: {
      src: unsplash("1515562141207-7a88fb7ce338", 1600),
      alt: "Pearl necklace with a crystal clasp in an open gift box",
    },
    gallery: [
      {
        src: detail("1515562141207-7a88fb7ce338", 0.55, 0.6, 2.5),
        alt: "Crystal-set clasp of the pearl necklace",
      },
      {
        src: detail("1515562141207-7a88fb7ce338", 0.4, 0.4, 2.2),
        alt: "Strand of graduated freshwater pearls",
      },
    ],
  },
  {
    slug: "crystal-drop-earrings",
    name: "Crystal drop earrings",
    category: "Jewelry",
    price: 74000,
    color: "Sapphire",
    stock: 9,
    description:
      "Statement drop earrings of baguette and marquise crystals framing a pear-cut sapphire-blue stone.",
    details: [
      "Rhodium-plated brass",
      "Glass crystals",
      "Post-back fastening",
      "Drop 5 cm",
    ],
    image: {
      src: unsplash("1535632066927-ab7c9ab60908", 1600),
      alt: "Pair of crystal and sapphire-blue drop earrings on a green leaf",
    },
    gallery: [
      {
        src: detail("1535632066927-ab7c9ab60908", 0.6, 0.3, 2.2),
        alt: "Close-up of an earring's pear-cut blue stone",
      },
      {
        src: detail("1535632066927-ab7c9ab60908", 0.45, 0.6, 2.2),
        alt: "Baguette crystals framing the blue stone",
      },
    ],
  },
  {
    slug: "pleated-wool-trouser",
    name: "Pleated wool trouser",
    category: "Ready-to-wear",
    price: 86000,
    color: "Dusty Blue",
    stock: 15,
    description:
      "A soft, high-rise trouser in brushed wool flannel with an elasticated waist, single front pleats and a gently tapered leg.",
    details: [
      "80% wool, 20% cashmere",
      "Elasticated waistband",
      "Side slip pockets",
      "Dry clean only",
    ],
    image: {
      src: unsplash("1506629082955-511b1aa562c8", 1600),
      alt: "Close-up of a hand in the pocket of soft blue pleated trousers",
    },
    gallery: [
      {
        src: detail("1506629082955-511b1aa562c8", 0.5, 0.6, 1.8),
        alt: "Front pleat and slip pocket of the trouser",
      },
      {
        src: detail("1506629082955-511b1aa562c8", 0.4, 0.4, 2.2),
        alt: "Elasticated waistband of the trouser",
      },
    ],
  },
];

// The Modern Tailoring edit (featured collection on the homepage).
export const tailoringEdit: SeedProduct[] = [
  {
    slug: "chambray-work-shirt",
    name: "Chambray work shirt",
    category: "Ready-to-wear",
    price: 64000,
    color: "Light Blue",
    stock: 20,
    description:
      "A washed cotton chambray shirt with a point collar, single chest pocket and a slightly boxy fit made for layering.",
    details: [
      "100% cotton chambray",
      "Mother-of-pearl buttons",
      "Chest patch pocket",
      "Machine wash cold",
    ],
    image: {
      src: unsplash("1558171813-4c088753af8f", 1600),
      alt: "Pale blue chambray shirt draped over a wooden chair",
    },
    gallery: [
      {
        src: detail("1558171813-4c088753af8f", 0.5, 0.3, 2.2),
        alt: "Point collar and button placket of the shirt",
      },
      {
        src: detail("1558171813-4c088753af8f", 0.6, 0.45, 2.5),
        alt: "Chest pocket of the chambray shirt",
      },
    ],
  },
  {
    slug: "polished-leather-derby",
    name: "Polished leather derby",
    category: "Shoes",
    price: 92000,
    color: "Tan",
    stock: 1,
    description:
      "A Goodyear-welted derby in hand-polished calfskin with a subtly perforated vamp and waxed cotton laces.",
    details: [
      "Hand-polished calfskin",
      "Leather lining and sole",
      "Goodyear-welted construction",
      "Waxed cotton laces",
    ],
    image: {
      src: unsplash("1614252235316-8c857d38b5f4", 1600),
      alt: "Close-up of brown leather derby shoes with waxed laces",
    },
    gallery: [
      {
        src: detail("1614252235316-8c857d38b5f4", 0.3, 0.5, 2),
        alt: "Waxed laces and perforated vamp of the derby",
      },
      {
        src: detail("1614252235316-8c857d38b5f4", 0.7, 0.6, 2),
        alt: "Polished toe of the tan derby",
      },
    ],
  },
  {
    slug: "round-metal-sunglasses",
    name: "Round metal sunglasses",
    category: "Eyewear",
    price: 52000,
    color: "Gold / Green",
    stock: 0,
    description:
      "Featherweight round sunglasses with a fine gold-tone metal frame and mineral-glass green lenses.",
    details: [
      "Gold-tone titanium frame",
      "Mineral-glass lenses",
      "100% UV protection",
      "Case and cloth included",
    ],
    image: {
      src: unsplash("1511499767150-a48a237f0083", 1600),
      alt: "Gold round sunglasses with green lenses on a white surface",
    },
    gallery: [
      {
        src: detail("1511499767150-a48a237f0083", 0.3, 0.55, 2.2),
        alt: "Green lens and fine gold frame of the sunglasses",
      },
      {
        src: detail("1511499767150-a48a237f0083", 0.65, 0.5, 2.5),
        alt: "Hinge and temple of the sunglasses",
      },
    ],
  },
  {
    slug: "nylon-city-backpack",
    name: "Nylon city backpack",
    category: "Bags",
    price: 115000,
    color: "Navy",
    stock: 6,
    description:
      "A streamlined everyday backpack in water-resistant recycled nylon, with a padded laptop compartment and hidden back pocket.",
    details: [
      "Recycled nylon",
      "Water-resistant coating",
      "Padded 14-inch laptop compartment",
      "Hidden back pocket",
    ],
    image: {
      src: unsplash("1553062407-98eeb64c6a62", 1600),
      alt: "Navy nylon backpack standing on a tiled floor",
    },
    gallery: [
      {
        src: detail("1553062407-98eeb64c6a62", 0.5, 0.4, 1.8),
        alt: "Top handle and front of the navy backpack",
      },
      {
        src: detail("1553062407-98eeb64c6a62", 0.45, 0.45, 2.6),
        alt: "Close-up of the recycled nylon texture",
      },
    ],
  },
];
