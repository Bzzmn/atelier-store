import Link from "next/link";

// Shown inside the account area for any order this customer can't see. It reads the same
// whether the order belongs to someone else, never completed or doesn't exist.
export default function OrderNotFound() {
  return (
    <>
      <h1 className="type-headline">We couldn&apos;t find this order</h1>
      <p className="type-body mt-3 text-fg-muted">
        It may belong to a different account, or the link may be incomplete. Orders placed as a
        guest aren&apos;t linked to your account.
      </p>
      <div className="hairline-t mt-10 pt-8">
        <Link href="/account/orders" className="btn btn-secondary">
          View your orders
        </Link>
      </div>
    </>
  );
}
