import Image from "next/image";
import Link from "next/link";

import { categories } from "@/lib/sample-data";

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-title" className="section-y">
      <div className="page-container mb-8 flex items-end justify-between gap-4">
        <h2 id="categories-title" className="type-title">
          Shop by Category
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-px md:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={category.href} className="group block">
              <div className="media-frame aspect-portrait">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="transition-transform duration-1000 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between px-3 pt-4 pb-2 md:px-4">
                <span className="type-label link-quiet group-hover:decoration-current">
                  {category.title}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
