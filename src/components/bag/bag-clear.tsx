"use client";

import { useEffect } from "react";

import { notifyBagChange } from "@/components/bag/use-bag-count";

// Rendered by the checkout success page once the order is paid or processing: empties the
// bag cookie (RSCs can't write cookies) and updates the header count.
export function BagClear() {
  useEffect(() => {
    fetch("/api/bag/clear", { method: "POST" })
      .then((response) => response.ok && notifyBagChange())
      .catch(() => {});
  }, []);

  return null;
}
