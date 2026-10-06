import Image from "next/image";
import Link from "next/link";

import { hero } from "@/lib/sample-data";

export function Hero() {
  const [primaryImage, secondaryImage] = hero.images;

  return (
    <section className="relative h-svh min-h-[36rem] bg-bg-inverse text-fg-inverse">
      <div className="absolute inset-0 grid md:grid-cols-2">
        <div className="media-frame">
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-[50%_30%]"
          />
        </div>
        <div className="media-frame hidden md:block">
          <Image
            src={secondaryImage.src}
            alt={secondaryImage.alt}
            fill
            preload
            sizes="50vw"
          />
        </div>
      </div>
      <div className="scrim absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/35 to-transparent" />

      <div className="page-container relative flex h-full flex-col items-center justify-end pb-16 text-center md:pb-20">
        <p className="type-label">{hero.eyebrow}</p>
        <h1 className="type-display mt-4">{hero.title}</h1>
        <p className="type-body mt-4 max-w-md">{hero.description}</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href={hero.primary.href} className="btn btn-inverse min-w-48">
            {hero.primary.label}
          </Link>
          <Link href={hero.secondary.href} className="btn btn-inverse min-w-48">
            {hero.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
