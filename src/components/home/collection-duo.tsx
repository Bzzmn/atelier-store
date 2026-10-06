import Image from "next/image";
import Link from "next/link";

import { collectionDuo } from "@/lib/sample-data";

export function CollectionDuo() {
  return (
    <section aria-label="Featured collections" className="section-y">
      <ul className="grid gap-px md:grid-cols-2">
        {collectionDuo.map((collection) => (
          <li key={collection.slug}>
            <Link href={collection.href} className="group relative block text-fg-inverse">
              <div className="media-frame aspect-portrait lg:aspect-auto lg:h-[calc(100svh-var(--header-height))] lg:max-h-[60rem]">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="transition-transform duration-1000 group-hover:scale-[1.03]"
                />
              </div>
              <div className="scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-8 text-center md:p-12">
                <p className="type-label">{collection.eyebrow}</p>
                <h2 className="type-headline">{collection.title}</h2>
                <span className="type-label link mt-2">Shop Now</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
