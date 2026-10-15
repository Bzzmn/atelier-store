"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 30; // about a minute

// Rendered while an order awaits payment confirmation. Polls the order's status and
// re-renders the page as soon as the webhook has moved it on. After about a minute it stops
// and says so; "Check again" re-renders the page and starts over.
export function OrderStatusPoller({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`/api/orders/status?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const { status } = (await response.json()) as { status: string | null };
        if (status && status !== "pending") {
          router.refresh();
          return;
        }
      } catch {
        if (controller.signal.aborted) return;
        // A network blip: keep trying until the attempts run out.
      }
      if (attempts >= MAX_ATTEMPTS) setTimedOut(true);
      else timer = setTimeout(poll, INTERVAL_MS);
    };

    timer = setTimeout(poll, INTERVAL_MS);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [sessionId, router, round]);

  if (!timedOut) return null;
  return (
    <div className="mt-6 flex flex-col items-start gap-4">
      <p role="status" className="type-body-sm text-fg-muted">
        This is taking longer than usual. If your payment went through, your order is safe and
        will be confirmed shortly.
      </p>
      <button
        type="button"
        onClick={() => {
          setTimedOut(false);
          setRound((value) => value + 1);
          router.refresh();
        }}
        className="btn btn-secondary"
      >
        Check again
      </button>
    </div>
  );
}
