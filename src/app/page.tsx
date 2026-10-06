import { CategoryGrid } from "@/components/home/category-grid";
import { CollectionDuo } from "@/components/home/collection-duo";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Newsletter } from "@/components/home/newsletter";
import { Services } from "@/components/home/services";

// Product sections read from the database; re-render at most once a minute.
export const revalidate = 60;

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <CategoryGrid />
      <FeaturedCollection />
      <NewArrivals />
      <EditorialBanner />
      <CollectionDuo />
      <Services />
      <Newsletter />
    </main>
  );
}
