"use client";

import { useEffect } from "react";

import { notifyBagChange } from "@/components/bag/use-bag-count";

// Rendered by the bag page when it clamped or dropped lines: saves those corrections to the
// cookie so the header count matches the page. Without JS the next bag action does it.
export function BagSync() {
  useEffect(() => {
    fetch("/api/bag/sync", { method: "POST" })
      .then((response) => response.ok && notifyBagChange())
      .catch(() => {});
  }, []);

  return null;
}
