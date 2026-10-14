import type { ReactNode } from "react";

import { AccountBreadcrumbs, AccountNav } from "@/components/account/account-nav";
import { SessionKeepAlive } from "@/components/auth/session-keep-alive";

// Shell shared by every /account section. It doesn't read the session: layouts
// don't re-render on navigation, so each page calls requireSession() itself.
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 pt-header pb-section">
      <SessionKeepAlive />
      <div className="page-container pt-10 md:pt-14">
        <AccountBreadcrumbs />
        <div className="mt-6 md:mt-10 md:grid-12">
          <div className="md:col-span-3">
            <div className="md:sticky md:top-[calc(var(--header-height)+2.5rem)]">
              <AccountNav />
            </div>
          </div>
          <div className="mt-8 md:col-span-9 md:mt-0 lg:col-span-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
