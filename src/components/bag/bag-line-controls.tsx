"use client";

import { type MouseEvent, useActionState, useEffect, useRef } from "react";

import { updateBagQuantity } from "@/app/bag/actions";
import { initialBagState } from "@/app/bag/state";
import { notifyBagChange } from "@/components/bag/use-bag-count";
import { MinusIcon, PlusIcon } from "@/components/icons";

type BagLineControlsProps = {
  slug: string;
  name: string;
  quantity: number;
  /** Highest quantity the server will accept now (stock, capped). */
  max: number;
  soldOut: boolean;
};

// Every button submits the new quantity (0 removes), so the stepper works without JS too.
// The server clamps to fresh stock and the page re-renders with the result.
export function BagLineControls({ slug, name, quantity, max, soldOut }: BagLineControlsProps) {
  const [state, formAction, pending] = useActionState(updateBagQuantity, initialBagState);

  const removing = useRef(false);

  useEffect(() => {
    if (state.id > 0) notifyBagChange();
  }, [state.id]);

  // A removed line unmounts with the focused button; send focus to the page heading
  // rather than letting it fall back to <body>.
  useEffect(
    () => () => {
      if (removing.current) document.getElementById("bag-title")?.focus();
    },
    [],
  );

  // aria-disabled rather than disabled, so focus stays put when a bound is reached.
  const blocked = (atBound: boolean) => ({
    "aria-disabled": pending || atBound || undefined,
    onClick: (event: MouseEvent) => {
      if (pending || atBound) event.preventDefault();
    },
  });

  return (
    <form action={formAction} aria-busy={pending || undefined}>
      <input type="hidden" name="slug" value={slug} />
      <div className="flex items-center justify-between gap-4">
        {!soldOut && (
          <div role="group" aria-label={`Quantity of ${name}`} className="flex items-center border border-border">
            <button
              type="submit"
              name="quantity"
              value={quantity - 1}
              aria-label="Decrease quantity"
              {...blocked(quantity <= 1)}
              className="flex size-10 items-center justify-center aria-disabled:opacity-40"
            >
              <MinusIcon width={16} height={16} />
            </button>
            <output aria-live="polite" className="type-caption w-8 text-center tabular-nums">
              {quantity}
            </output>
            <button
              type="submit"
              name="quantity"
              value={quantity + 1}
              aria-label={quantity >= max ? `Increase quantity (only ${max} available)` : "Increase quantity"}
              {...blocked(quantity >= max)}
              className="flex size-10 items-center justify-center aria-disabled:opacity-40"
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
        )}
        <button
          type="submit"
          name="quantity"
          value="0"
          aria-label={`Remove ${name}`}
          {...blocked(false)}
          onFocus={() => (removing.current = true)}
          onBlur={() => (removing.current = false)}
          className="btn btn-ghost type-label ml-auto"
        >
          Remove
        </button>
      </div>
      <p
        role="status"
        className={
          state.status === "success" || state.status === "idle"
            ? "sr-only"
            : `type-body-sm mt-2 ${state.status === "error" ? "text-error" : "text-fg-muted"}`
        }
      >
        {state.message}
      </p>
    </form>
  );
}
