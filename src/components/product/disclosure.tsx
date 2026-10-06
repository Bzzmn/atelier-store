import type { ReactNode } from "react";

import { PlusIcon } from "@/components/icons";

type DisclosureProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

// Native <details> accordion row separated by hairlines.
export function Disclosure({ title, children, defaultOpen }: DisclosureProps) {
  return (
    <details open={defaultOpen} className="group hairline-b">
      <summary className="type-label flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon
          width={16}
          height={16}
          className="transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="type-body-sm pb-6 text-fg-muted">{children}</div>
    </details>
  );
}
