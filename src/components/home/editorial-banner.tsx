import Image from "next/image";
import Link from "next/link";

import { editorialBanner } from "@/lib/sample-data";

export function EditorialBanner() {
  const { image } = editorialBanner;

  return (
    <section
      aria-labelledby="editorial-title"
      className="relative flex h-[80svh] max-h-[56rem] min-h-[32rem] items-center bg-bg-inverse text-fg-inverse"
    >
      <div className="media-frame absolute inset-0">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <div className="prose-container relative py-16 text-center">
        <p className="type-label">{editorialBanner.eyebrow}</p>
        <h2 id="editorial-title" className="type-display mt-4">
          {editorialBanner.title}
        </h2>
        <p className="type-body mx-auto mt-6 max-w-lg">{editorialBanner.description}</p>
        <Link href={editorialBanner.cta.href} className="btn btn-inverse mt-8">
          {editorialBanner.cta.label}
        </Link>
      </div>
    </section>
  );
}
