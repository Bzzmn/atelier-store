"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

// Server components can't write cookies, so reading the session there never
// extends it. This hits /api/auth/get-session once per mount, which slides the
// expiry (at most once per updateAge) and re-issues the cookies.
export function SessionKeepAlive() {
  useEffect(() => {
    void authClient.getSession();
  }, []);
  return null;
}
