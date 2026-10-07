// Seed catalog for `pnpm db:seed`, moved from the original placeholder data.
// Photography: Unsplash (https://unsplash.com/license).

import type { Gender } from "@/db/schema";
import type { ImageAsset } from "@/lib/catalog";
import { detail, unsplash } from "@/lib/unsplash";

export type SeedProduct = {
  slug: string;
  name: string;
  category: string; // category name; must match one in `seedCategories`
  gender: Gender;
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
  "Accessories",
];

// Shown as New Arrivals on the homepage, so they're seeded as the newest products.
export const newArrivals: SeedProduct[] = [
  {
    slug: "lambskin-biker-jacket",
    name: "Lambskin biker jacket",
    category: "Outerwear",
    gender: "women",
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
    gender: "women",
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
    gender: "women",
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
    gender: "unisex",
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
    gender: "unisex",
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
    gender: "women",
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
    gender: "women",
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
    gender: "women",
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
    gender: "men",
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
    gender: "men",
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
    gender: "unisex",
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
    gender: "unisex",
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
  {
    slug: "windowpane-wool-blazer",
    name: "Windowpane wool blazer",
    category: "Ready-to-wear",
    gender: "men",
    price: 168000,
    color: "Navy",
    stock: 9,
    description:
      "A single-breasted blazer in a navy wool twill with a blue windowpane check. Cut with peak lapels, a natural shoulder and patch pockets for a softer take on city tailoring.",
    details: [
      "100% virgin wool",
      "Half-canvas construction",
      "Peak lapels, single button",
      "Patch hip pockets",
      "Made in Italy",
    ],
    image: {
      src: unsplash("1592878904946-b3cd8ae243d0", 1600),
      alt: "Man in a navy windowpane check blazer over a blue shirt and tie",
    },
    gallery: [
      {
        src: detail("1592878904946-b3cd8ae243d0", 0.62, 0.2, 2.4),
        alt: "Peak lapel and lapel pin of the navy blazer",
      },
      {
        src: detail("1592878904946-b3cd8ae243d0", 0.3, 0.78, 2.2),
        alt: "Patch pocket and cuff of the blazer",
      },
    ],
  },
  {
    slug: "double-breasted-check-blazer",
    name: "Double-breasted check blazer",
    category: "Ready-to-wear",
    gender: "women",
    price: 142000,
    color: "Grey Check",
    stock: 3,
    description:
      "An oversized double-breasted blazer in a grey Prince of Wales check, with broad peak lapels and a long, relaxed line. Wear it buttoned as a jacket or open over a silk blouse.",
    details: [
      "Wool and viscose blend",
      "Viscose lining",
      "Six-button double-breasted front",
      "Flap pockets",
      "Dry clean only",
    ],
    image: {
      src: unsplash("1608234808654-2a8875faa7fd", 1600),
      alt: "Woman in a long grey check double-breasted blazer over a white shirt",
    },
    gallery: [
      {
        src: detail("1608234808654-2a8875faa7fd", 0.35, 0.72, 2.4),
        alt: "Horn-effect buttons and flap pocket of the check blazer",
      },
      {
        src: detail("1608234808654-2a8875faa7fd", 0.45, 0.32, 2.4),
        alt: "Peak lapel of the blazer over a white shirt with a ribbon tie",
      },
    ],
  },
  {
    slug: "peak-lapel-dinner-jacket",
    name: "Peak-lapel dinner jacket",
    category: "Ready-to-wear",
    gender: "men",
    price: 245000,
    color: "Black",
    stock: 5,
    description:
      "An evening jacket in black wool barathea with satin-faced peak lapels and a single covered button. Lightly structured, with a clean chest and a sharp, close-fitting waist.",
    details: [
      "100% wool barathea",
      "Silk satin lapel facings",
      "Covered single button",
      "Jetted pockets",
      "Made in Italy",
    ],
    image: {
      src: unsplash("1598808503746-f34c53b9323e", 1600),
      alt: "Black peak-lapel dinner jacket with a satin tie on a tailor's mannequin",
    },
    gallery: [
      {
        src: detail("1598808503746-f34c53b9323e", 0.55, 0.5, 2.2),
        alt: "Satin peak lapel and pocket square of the dinner jacket",
      },
      {
        src: detail("1598808503746-f34c53b9323e", 0.62, 0.42, 3),
        alt: "White flower boutonniere on the satin lapel",
      },
    ],
  },
  {
    slug: "belted-wool-wrap-coat",
    name: "Belted wool wrap coat",
    category: "Outerwear",
    gender: "women",
    price: 198000,
    color: "Camel",
    stock: 7,
    description:
      "A wrap coat in double-faced camel wool, with wide notched lapels, a tie belt and a softly curved hem. Unlined, so it drapes close to the body.",
    details: [
      "90% wool, 10% cashmere",
      "Double-faced, unlined",
      "Self-tie belt",
      "Side seam pockets",
      "Dry clean only",
    ],
    image: {
      src: unsplash("1539533018447-63fcce2678e3", 1600),
      alt: "Woman in a belted camel wrap coat sitting on stone steps",
    },
    gallery: [
      {
        src: detail("1539533018447-63fcce2678e3", 0.5, 0.32, 2.4),
        alt: "Tie belt and lapels of the camel coat",
      },
      {
        src: detail("1539533018447-63fcce2678e3", 0.55, 0.58, 2),
        alt: "Curved front hem of the wrap coat",
      },
    ],
  },
  {
    slug: "windowpane-three-piece-suit",
    name: "Windowpane three-piece suit",
    category: "Ready-to-wear",
    gender: "men",
    price: 296000,
    color: "Cornflower Blue",
    stock: 2,
    description:
      "A three-piece suit in brushed cornflower-blue wool with a fine windowpane overcheck: a two-button jacket with notch lapels, a five-button waistcoat and flat-front trousers.",
    details: [
      "100% brushed wool",
      "Jacket, waistcoat and trousers",
      "Half-canvas jacket",
      "Five-button waistcoat",
      "Made in Italy",
    ],
    image: {
      src: unsplash("1594938298603-c8148c4dae35", 1600),
      alt: "Man in a blue windowpane three-piece suit holding the lapels of the jacket",
    },
    gallery: [
      {
        src: detail("1594938298603-c8148c4dae35", 0.5, 0.5, 2.2),
        alt: "Buttoned waistcoat under the open suit jacket",
      },
      {
        src: detail("1594938298603-c8148c4dae35", 0.68, 0.22, 2.6),
        alt: "Notch lapel and white pocket square of the suit",
      },
    ],
  },
  {
    slug: "striped-poplin-shirt",
    name: "Striped poplin shirt",
    category: "Ready-to-wear",
    gender: "men",
    price: 39000,
    color: "Sky Blue",
    stock: 24,
    description:
      "A crisp cotton poplin shirt in a fine sky-blue stripe, with a semi-spread collar and barrel cuffs. Cut slim to sit cleanly under a jacket.",
    details: [
      "100% cotton poplin",
      "Semi-spread collar",
      "Mother-of-pearl buttons",
      "Machine wash at 30°C",
    ],
    image: {
      src: unsplash("1620012253295-c15cc3e65df4", 1600),
      alt: "Man in a sky-blue striped shirt, navy dot tie and cream pleated trousers",
    },
    gallery: [
      {
        src: detail("1620012253295-c15cc3e65df4", 0.55, 0.6, 2.6),
        alt: "Barrel cuff of the striped shirt",
      },
      {
        src: detail("1620012253295-c15cc3e65df4", 0.4, 0.5, 3),
        alt: "Close-up of the fine blue stripe",
      },
    ],
  },
];

// The Statement Outerwear edit (women).
export const outerwearEdit: SeedProduct[] = [
  {
    slug: "oversized-puffer-jacket",
    name: "Oversized puffer jacket",
    category: "Outerwear",
    gender: "women",
    price: 129000,
    color: "Sunflower",
    stock: 6,
    description:
      "A cropped, oversized puffer in glossy sunflower-yellow nylon, with a high funnel collar and dropped shoulders. Filled with responsibly sourced down for warmth without weight.",
    details: [
      "Recycled nylon shell",
      "Responsibly sourced down fill",
      "Two-way zip and snap placket",
      "Elasticated cuffs",
      "Machine wash cold",
    ],
    image: {
      src: unsplash("1548624313-0396c75e4b1a", 1600),
      alt: "Woman in an oversized sunflower-yellow puffer jacket and lilac sunglasses",
    },
    gallery: [
      {
        src: detail("1548624313-0396c75e4b1a", 0.75, 0.55, 2.4),
        alt: "Funnel collar and snap placket of the puffer",
      },
      {
        src: detail("1548624313-0396c75e4b1a", 0.3, 0.8, 2.2),
        alt: "Quilted sleeve of the yellow puffer",
      },
    ],
  },
  {
    slug: "ruffle-placket-wool-coat",
    name: "Ruffle-placket wool coat",
    category: "Outerwear",
    gender: "women",
    price: 238000,
    color: "Black",
    stock: 3,
    description:
      "A slim, knee-length coat in black wool crêpe, finished with a cascading ruffle down the front placket and at the cuffs, and fastened with pearl-effect buttons.",
    details: [
      "Wool crêpe",
      "Silk-blend lining",
      "Pearl-effect buttons",
      "Ruffled placket and cuffs",
      "Dry clean only",
    ],
    image: {
      src: unsplash("1554412933-514a83d2f3c8", 1600),
      alt: "Woman in a black ruffle-front wool coat and a wide-brimmed hat",
    },
    gallery: [
      {
        src: detail("1554412933-514a83d2f3c8", 0.55, 0.45, 2.6),
        alt: "Ruffle placket and pearl buttons of the coat",
      },
      {
        src: detail("1554412933-514a83d2f3c8", 0.45, 0.75, 2.2),
        alt: "Ruffled cuff and hem of the black coat",
      },
    ],
  },
  {
    slug: "shearling-trim-suede-jacket",
    name: "Shearling-trim suede jacket",
    category: "Outerwear",
    gender: "women",
    price: 265000,
    color: "Chestnut",
    stock: 4,
    description:
      "A cropped biker in brushed chestnut suede, lined and trimmed in soft cream shearling, with an asymmetric zip and a buckled hem belt.",
    details: [
      "Goat suede",
      "Shearling lining and collar",
      "Asymmetric zip front",
      "Buckled hem belt",
      "Specialist leather clean",
    ],
    image: {
      src: unsplash("1608063615781-e2ef8c73d114", 1600),
      alt: "Woman in a chestnut suede jacket with a cream shearling collar over a plaid shirt",
    },
    gallery: [
      {
        src: detail("1608063615781-e2ef8c73d114", 0.35, 0.5, 2.4),
        alt: "Cream shearling collar and zip of the suede jacket",
      },
      {
        src: detail("1608063615781-e2ef8c73d114", 0.6, 0.85, 2.4),
        alt: "Buckled hem belt of the suede jacket",
      },
    ],
  },
  {
    slug: "hooded-boucle-coat",
    name: "Hooded bouclé coat",
    category: "Outerwear",
    gender: "women",
    price: 189000,
    color: "Poppy Red",
    stock: 8,
    description:
      "A relaxed, hooded coat in a dense poppy-red wool bouclé, with dropped shoulders and deep patch pockets. A bright note for grey days.",
    details: [
      "70% wool bouclé",
      "Unlined hood",
      "Concealed snap front",
      "Patch pockets",
      "Dry clean only",
    ],
    image: {
      src: detail("1604644401890-0bd678c83788", 0.56, 0.62, 2.4),
      alt: "Poppy-red hooded bouclé coat on a clothes rail",
    },
    gallery: [
      {
        src: detail("1604644401890-0bd678c83788", 0.6, 0.4, 2.6),
        alt: "Hood of the poppy-red bouclé coat on its hanger",
      },
      {
        src: detail("1604644401890-0bd678c83788", 0.55, 0.7, 3),
        alt: "Close-up of the looped wool bouclé",
      },
    ],
  },
  {
    slug: "cotton-utility-jacket",
    name: "Cotton utility jacket",
    category: "Outerwear",
    gender: "women",
    price: 98000,
    color: "Olive",
    stock: 11,
    description:
      "An oversized field jacket in washed olive cotton twill, with four bellows pockets, epaulettes and a drawcord waist. Roll the sleeves and wear it over everything.",
    details: [
      "100% cotton twill",
      "Garment-washed",
      "Four bellows pockets",
      "Drawcord waist",
      "Machine wash cold",
    ],
    image: {
      src: unsplash("1544022613-e87ca75a784a", 1600),
      alt: "Woman in an oversized olive utility jacket and a black beanie",
    },
    gallery: [
      {
        src: detail("1544022613-e87ca75a784a", 0.3, 0.68, 2.4),
        alt: "Bellows pocket and buttons of the utility jacket",
      },
      {
        src: detail("1544022613-e87ca75a784a", 0.75, 0.5, 2.4),
        alt: "Chest pocket and rolled sleeve of the olive jacket",
      },
    ],
  },
  {
    slug: "satin-bomber-jacket",
    name: "Satin bomber jacket",
    category: "Outerwear",
    gender: "women",
    price: 89000,
    color: "Rust",
    stock: 12,
    description:
      "A lightweight bomber in fluid rust satin, with ribbed trims, a zipped utility pocket on the sleeve and a softly gathered hem.",
    details: [
      "Recycled polyester satin",
      "Ribbed collar, cuffs and hem",
      "Sleeve zip pocket",
      "Welt hand pockets",
      "Machine wash cold",
    ],
    image: {
      src: unsplash("1591047139829-d91aecb6caea", 1600),
      alt: "Rust satin bomber jacket held up on a white hanger",
    },
    gallery: [
      {
        src: detail("1591047139829-d91aecb6caea", 0.42, 0.6, 2.6),
        alt: "Zip front and welt pocket of the satin bomber",
      },
      {
        src: detail("1591047139829-d91aecb6caea", 0.82, 0.38, 3),
        alt: "Zipped sleeve pocket of the rust bomber",
      },
    ],
  },
];

// The Leather Edit (men).
export const leatherEdit: SeedProduct[] = [
  {
    slug: "leather-bomber-jacket",
    name: "Leather bomber jacket",
    category: "Outerwear",
    gender: "men",
    price: 245000,
    color: "Black",
    stock: 5,
    description:
      "A clean bomber cut from washed black lambskin, with a ribbed collar, cuffs and hem. Slim through the body and soft enough to wear from the first day.",
    details: [
      "100% lambskin leather",
      "Cotton twill lining",
      "Ribbed knit trims",
      "Two welt pockets",
      "Made in Italy",
    ],
    image: {
      src: unsplash("1520367745676-56196632073f", 1600),
      alt: "Man in a black leather bomber jacket, white T-shirt and grey trousers",
    },
    gallery: [
      {
        src: detail("1520367745676-56196632073f", 0.36, 0.32, 2.8),
        alt: "Ribbed collar and zip of the leather bomber",
      },
      {
        src: detail("1520367745676-56196632073f", 0.6, 0.4, 2.6),
        alt: "Sleeve and ribbed cuff of the black leather bomber",
      },
    ],
  },
  {
    slug: "shearling-aviator-jacket",
    name: "Shearling aviator jacket",
    category: "Outerwear",
    gender: "men",
    price: 380000,
    color: "Dark Brown",
    stock: 2,
    description:
      "A heavyweight aviator in dark brown sheepskin, worn shearling-side in, with a wide cream collar, an asymmetric zip and buckled throat latch.",
    details: [
      "Sheepskin leather",
      "Natural shearling lining",
      "Asymmetric zip front",
      "Buckled collar strap",
      "Specialist leather clean",
    ],
    image: {
      src: detail("1559551409-dadc959f76b8", 0.45, 0.5, 2),
      alt: "Dark brown leather shearling aviator jacket hanging against a brick wall",
    },
    gallery: [
      {
        src: detail("1559551409-dadc959f76b8", 0.3, 0.5, 2.2),
        alt: "Distressed leather and zip of the aviator jacket",
      },
      {
        src: detail("1559551409-dadc959f76b8", 0.55, 0.45, 2.4),
        alt: "Cream shearling collar of the aviator jacket",
      },
    ],
  },
  {
    slug: "cap-toe-leather-boot",
    name: "Cap-toe leather boot",
    category: "Shoes",
    gender: "men",
    price: 89000,
    color: "Espresso",
    stock: 10,
    description:
      "A refined lace-up boot in waxed espresso calfskin, with a brogued cap toe, speed-hook eyelets and a stacked leather heel on a Goodyear-welted sole.",
    details: [
      "Waxed calfskin upper",
      "Leather lining",
      "Goodyear-welted leather sole",
      "Speed-hook eyelets",
      "Made in Portugal",
    ],
    image: {
      src: unsplash("1608256246200-53e635b5b65f", 1600),
      alt: "Pair of dark brown cap-toe leather lace-up boots under a spotlight",
    },
    gallery: [
      {
        src: detail("1608256246200-53e635b5b65f", 0.45, 0.4, 2.4),
        alt: "Waxed laces and eyelets of the brown boots",
      },
      {
        src: detail("1608256246200-53e635b5b65f", 0.6, 0.6, 2.4),
        alt: "Brogued cap toe of the leather boot",
      },
    ],
  },
  {
    slug: "full-grain-leather-belt",
    name: "Full-grain leather belt",
    category: "Accessories",
    gender: "men",
    price: 32000,
    color: "Tan",
    stock: 16,
    description:
      "A 3.5 cm belt cut from a single strip of vegetable-tanned full-grain leather, edge-stitched and finished with a brushed nickel buckle. It darkens beautifully with wear.",
    details: [
      "Vegetable-tanned full-grain leather",
      "Brushed nickel buckle",
      "3.5 cm width",
      "Hand-stitched edges",
      "Made in Spain",
    ],
    image: {
      src: detail("1624222247344-550fb60583dc", 0.6, 0.5, 1),
      alt: "Tan leather belt with a silver buckle",
    },
    gallery: [
      {
        src: detail("1624222247344-550fb60583dc", 0.65, 0.55, 2.4),
        alt: "Brushed nickel buckle and keeper of the belt",
      },
      {
        src: detail("1624222247344-550fb60583dc", 0.45, 0.55, 2),
        alt: "Stitched edge of the tan leather belt",
      },
    ],
  },
  {
    slug: "bifold-leather-wallet",
    name: "Bifold leather wallet",
    category: "Accessories",
    gender: "men",
    price: 29000,
    color: "Cognac",
    stock: 18,
    description:
      "A slim bifold in hand-burnished cognac leather, with six card slots and a full-length note pocket. Pull-up leather that marks and mellows over time.",
    details: [
      "Pull-up cowhide leather",
      "Six card slots",
      "Full-length note pocket",
      "Hand-burnished edges",
      "Made in Spain",
    ],
    image: {
      src: unsplash("1627123424574-724758594e93", 1600),
      alt: "Cognac leather bifold wallet against a dark background",
    },
    gallery: [
      {
        src: detail("1627123424574-724758594e93", 0.55, 0.45, 2.6),
        alt: "Burnished cognac leather of the wallet",
      },
      {
        src: detail("1627123424574-724758594e93", 0.5, 0.5, 3.2),
        alt: "Stitched fold of the bifold wallet",
      },
    ],
  },
  {
    slug: "lace-up-work-boot",
    name: "Lace-up work boot",
    category: "Shoes",
    gender: "men",
    price: 69000,
    color: "Tan",
    stock: 14,
    description:
      "A rugged six-eye work boot in oiled tan nubuck, with padded collars, waxed laces and a lugged rubber sole that grips in every season.",
    details: [
      "Oiled nubuck upper",
      "Padded leather collar",
      "Waxed cotton laces",
      "Lugged rubber sole",
      "Water-resistant finish",
    ],
    image: {
      src: unsplash("1520639888713-7851133b1ed0", 1600),
      alt: "Man lacing up tan leather work boots on asphalt",
    },
    gallery: [
      {
        src: detail("1520639888713-7851133b1ed0", 0.3, 0.55, 2.2),
        alt: "Toe and lugged sole of the tan work boot",
      },
      {
        src: detail("1520639888713-7851133b1ed0", 0.62, 0.5, 2.2),
        alt: "Waxed laces and eyelets of the work boot",
      },
    ],
  },
];
