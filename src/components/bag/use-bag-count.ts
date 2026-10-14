"use client";

import { useSyncExternalStore } from "react";

import { BAG_COOKIE, bagCount, parseBag } from "@/lib/bag-cookie";

// The header is part of every static page, so it reads the bag count from the cookie in
// the browser instead of on the server. Bag actions set the cookie and then call
// notifyBagChange(); focus and tab switches catch changes made in other tabs.

const EVENT = "bag-change";

export function notifyBagChange() {
  window.dispatchEvent(new Event(EVENT));
}

function readCount() {
  const prefix = `${BAG_COOKIE}=`;
  const raw = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
  if (!raw) return 0;
  try {
    return bagCount(parseBag(decodeURIComponent(raw)));
  } catch {
    return 0;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** Units in the bag, as stored. 0 during server rendering and hydration. */
export function useBagCount() {
  return useSyncExternalStore(subscribe, readCount, () => 0);
}
