"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ImageAsset } from "@/lib/catalog";

type ProductGalleryProps = {
  images: ImageAsset[];
  name: string;
};

// Mobile: swipeable full-width carousel with a counter.
// Desktop: lead image full width, the rest in a two-up grid.
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scroller.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
        tabIndex={0}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-px lg:overflow-visible"
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className={`media-frame aspect-portrait w-full shrink-0 snap-start ${
              index === 0 ? "lg:col-span-2 lg:aspect-[4/5]" : ""
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              preload={index === 0}
              sizes={index === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <p
          aria-hidden="true"
          className="type-micro absolute right-gutter bottom-4 bg-bg px-2 py-1 lg:hidden"
        >
          {active + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
