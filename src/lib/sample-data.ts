// Editorial content for the storefront (hero, tiles, banners, navigation).
// Products live in the database: see `src/lib/catalog.ts`.
// Photography: Unsplash (https://unsplash.com/license).

import type { ImageAsset } from "@/lib/catalog";
import { unsplash } from "@/lib/unsplash";

export type Collection = {
  slug: string;
  title: string;
  eyebrow?: string;
  description?: string;
  href: string;
  image: ImageAsset;
};

export const hero = {
  eyebrow: "Autumn–Winter 2026",
  title: "Quiet Forms",
  description:
    "Soft tailoring, sculpted leather and fluid volumes for the season ahead.",
  primary: { label: "Shop Women", href: "/shop/women" },
  secondary: { label: "Shop Men", href: "/shop/men" },
  images: [
    {
      src: unsplash("1581044777550-4cfa60707c03", 2000),
      alt: "Model in a pale pink ruffled dress standing in a golden field",
    },
    {
      src: unsplash("1520975954732-35dd22299614", 2000),
      alt: "Model in a black leather jacket crouching on a brick ledge",
    },
  ],
} satisfies {
  eyebrow: string;
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  images: [ImageAsset, ImageAsset];
};

export const categories: Collection[] = [
  {
    slug: "women",
    title: "Women",
    href: "/shop/women",
    image: {
      src: unsplash("1485968579580-b6d095142e6e", 1200),
      alt: "Woman in a tailored plaid coat on a city street",
    },
  },
  {
    slug: "men",
    title: "Men",
    href: "/shop/men",
    image: {
      src: unsplash("1617137968427-85924c800a22", 1200),
      alt: "Man in a navy suit walking past a glass façade",
    },
  },
  {
    slug: "bags",
    title: "Bags",
    href: "/shop/bags",
    image: {
      src: unsplash("1594223274512-ad4803739b7c", 1200),
      alt: "Teal leather top-handle bag resting on books",
    },
  },
  {
    slug: "shoes",
    title: "Shoes",
    href: "/shop/shoes",
    image: {
      src: unsplash("1543163521-1bf539c55dd2", 1200),
      alt: "Floral print stiletto pumps against a pale blue wall",
    },
  },
];

/** A collection with its own /collections/[slug] page, listing these products in order. */
export type ProductCollection = Collection & { productSlugs: string[] };

export const featuredCollection: ProductCollection = {
  slug: "tailoring",
  eyebrow: "The Collection",
  title: "Modern Tailoring",
  description:
    "Precise shoulders, softened lines. Suiting cut in Italian wool to move from the boardroom to the evening.",
  href: "/collections/tailoring",
  image: {
    src: unsplash("1507679799987-c73779587ccf", 2000),
    alt: "Man buttoning a navy suit jacket over a striped tie",
  },
  // Order matters: the homepage previews the first PREVIEW_COUNT (featured-collection.tsx).
  productSlugs: [
    "windowpane-wool-blazer",
    "double-breasted-check-blazer",
    "peak-lapel-dinner-jacket",
    "belted-wool-wrap-coat",
    "windowpane-three-piece-suit",
    "striped-poplin-shirt",
    "pleated-wool-trouser",
    "polished-leather-derby",
  ],
};

export const editorialBanner = {
  eyebrow: "The Atelier",
  title: "Made by Hand, Made to Last",
  description:
    "Every piece begins at the workbench — cut, stitched and finished by artisans who have perfected their craft over decades.",
  cta: { label: "Discover the Craft", href: "/atelier" },
  image: {
    src: unsplash("1445205170230-053b83016050", 2400),
    alt: "Rails of knitwear and coats in a warmly lit boutique",
  },
};

export const collectionDuo: ProductCollection[] = [
  {
    slug: "outerwear",
    eyebrow: "Women",
    title: "Statement Outerwear",
    description:
      "Coats and jackets with something to say: sculpted wool, glossy down, suede and shearling in colours made for winter light.",
    href: "/collections/outerwear",
    image: {
      src: unsplash("1539109136881-3be0616acf4b", 1600),
      alt: "Woman in a long powder-blue coat in front of a gothic cathedral",
    },
    productSlugs: [
      "oversized-puffer-jacket",
      "ruffle-placket-wool-coat",
      "shearling-trim-suede-jacket",
      "hooded-boucle-coat",
      "lambskin-biker-jacket",
      "belted-wool-wrap-coat",
      "cotton-utility-jacket",
      "satin-bomber-jacket",
    ],
  },
  {
    slug: "leather",
    eyebrow: "Men",
    title: "The Leather Edit",
    description:
      "Jackets, boots and small leather goods in full-grain hides, made to soften, darken and take on the shape of the life they're worn in.",
    href: "/collections/leather",
    image: {
      src: unsplash("1487222477894-8943e31ef7b2", 1600),
      alt: "Man in a tan leather jacket and round sunglasses",
    },
    productSlugs: [
      "leather-bomber-jacket",
      "shearling-aviator-jacket",
      "cap-toe-leather-boot",
      "polished-leather-derby",
      "grained-leather-backpack",
      "full-grain-leather-belt",
      "bifold-leather-wallet",
      "lace-up-work-boot",
    ],
  },
];

// Collections with their own /collections/[slug] page.
export const collectionPages: ProductCollection[] = [featuredCollection, ...collectionDuo];

export const services = [
  {
    title: "Complimentary Shipping",
    description: "Free express delivery on every order, with tracking.",
  },
  {
    title: "Returns & Exchanges",
    description: "Thirty days to return or exchange, collected from your door.",
  },
  {
    title: "Signature Packaging",
    description: "Each order arrives wrapped and ready to give.",
  },
  {
    title: "Client Services",
    description: "Advisors available by phone, email and live chat.",
  },
];

export const navigation = [
  { label: "New In", href: "/shop/new" },
  { label: "Women", href: "/shop/women" },
  { label: "Men", href: "/shop/men" },
  { label: "Bags", href: "/shop/bags" },
  { label: "Shoes", href: "/shop/shoes" },
  { label: "Jewelry", href: "/shop/jewelry" },
];

export const footerLinks = [
  {
    title: "Client Services",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns", href: "/help/returns" },
      { label: "FAQ", href: "/help" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About", href: "/about" },
      { label: "The Atelier", href: "/atelier" },
      { label: "Careers", href: "/careers" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Sale", href: "/legal/terms" },
      { label: "Cookie Settings", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];
