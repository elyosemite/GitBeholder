import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ColumnHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 flex-none border-b border-line-subtle bg-panel px-4 py-2.5">
      <h2 className="text-[12.5px] font-semibold text-ink">{title}</h2>
    </div>
  );
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-line-subtle px-4 py-3">
      <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        {title}
      </div>
      {children}
    </div>
  );
}

export function PanelEmpty({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11.5px] text-ink-faint">
      {Icon && <Icon aria-hidden="true" size={14} className="flex-none" />}
      {children}
    </div>
  );
}

export function ColumnEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6 text-center text-[12.5px] text-ink-faint">
      {children}
    </div>
  );
}
