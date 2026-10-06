import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col pt-header">
      <div className="prose-container section-y flex flex-1 flex-col items-center justify-center text-center">
        <p className="type-label text-fg-muted">404</p>
        <h1 className="type-headline mt-3">This page could not be found</h1>
        <p className="type-body mt-4 text-fg-muted">
          The piece you are looking for may have moved or is no longer available.
        </p>
        <Link href="/" className="btn btn-secondary mt-8">
          Return Home
        </Link>
      </div>
    </main>
  );
}
