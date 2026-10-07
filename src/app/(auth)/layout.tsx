import type { ReactNode } from "react";

// Narrow, centered column shared by sign-in and sign-up.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col pt-header">
      <div className="page-container section-y flex flex-1 justify-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
