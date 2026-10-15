"use client";

import { useEffect, useState } from "react";

/**
 * Confirms a product was just created (the page gets `?created=1`). It hides on the first form
 * submit, so it doesn't sit beside later results. Hiding is client state: the router keeps
 * the query string and re-renders the page with it after each save.
 */
export function CreatedNotice() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    document.addEventListener("submit", hide, { once: true });
    return () => document.removeEventListener("submit", hide);
  }, []);

  if (!visible) return null;
  return (
    <p role="status" className="type-body-sm mt-4 text-success">
      Product created. It&apos;s live in the store.
    </p>
  );
}
