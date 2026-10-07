import { GenderPage, genderMetadata } from "../gender-page";

// Products come from the database; re-render at most once a minute.
export const revalidate = 60;

export const metadata = genderMetadata("women");

export default function WomenPage() {
  return <GenderPage gender="women" />;
}
