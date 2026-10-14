"use client";

import { useEffect, useState } from "react";

// Page-level live region for bag messages that outlive their line: a removed line unmounts
// together with its own status message, so screen readers would never hear it.

const EVENT = "bag-announce";

export function announceBag(message: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function BagAnnouncer() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onAnnounce = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener(EVENT, onAnnounce);
    return () => window.removeEventListener(EVENT, onAnnounce);
  }, []);

  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
