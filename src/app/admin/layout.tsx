import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminBreadcrumbs, AdminNav } from "@/components/admin/admin-nav";
import { SessionKeepAlive } from "@/components/auth/session-keep-alive";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Shell shared by every /admin section. It doesn't check the role: layouts don't re-render on
// navigation, so each page and server action calls requireAdmin() itself (admin-guard.test.ts).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 pt-header pb-section">
      <SessionKeepAlive />
      <div className="page-container pt-10 md:pt-14">
        <AdminBreadcrumbs />
        <div className="mt-6 md:mt-10 md:grid-12">
          <div className="md:col-span-3 lg:col-span-2">
            <div className="md:sticky md:top-[calc(var(--header-height)+2.5rem)]">
              <AdminNav />
            </div>
          </div>
          <div className="mt-8 min-w-0 md:col-span-9 md:mt-0 lg:col-span-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
