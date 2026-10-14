"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { addToBag } from "@/app/bag/actions";
import { initialBagState } from "@/app/bag/state";
import { notifyBagChange } from "@/components/bag/use-bag-count";

// Posts to a server action, so it also works before hydration (the page then re-renders
// with the result). The server checks stock; this page's stock may be a minute old.
export function AddToBagForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(addToBag, initialBagState);

  useEffect(() => {
    if (state.id > 0) notifyBagChange();
  }, [state.id]);

  const added = state.status === "success" || state.status === "notice";

  return (
    <form action={formAction} aria-busy={pending || undefined} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      {/* aria-disabled rather than disabled, so focus stays on the button while pending. */}
      <button
        type="submit"
        aria-disabled={pending || undefined}
        onClick={(event) => pending && event.preventDefault()}
        className="btn btn-primary w-full"
      >
        {pending ? "Adding…" : "Add to Shopping Bag"}
      </button>
      <p
        role="status"
        className={`type-body-sm text-center empty:hidden ${
          state.status === "error" ? "text-error" : "text-fg-muted"
        }`}
      >
        {state.message}
        {added && (
          <>
            {" "}
            <Link href="/bag" className="link text-fg">
              View bag
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
