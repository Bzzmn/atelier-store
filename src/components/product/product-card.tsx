import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  sizes?: string;
};

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
}: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block bg-bg">
      <div className="media-frame aspect-product">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={sizes}
          className="transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {(product.stock <= 0 || product.badge) && (
          <span className="type-micro absolute top-3 left-3 bg-bg px-2 py-1">
            {product.stock <= 0 ? "Sold out" : product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pt-3 pb-8 md:pb-10">
        <h3 className="type-caption link-quiet group-hover:decoration-current">{product.name}</h3>
        <p className="type-body-sm text-fg-muted">{product.category.name}</p>
        <p className="type-caption mt-2">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
