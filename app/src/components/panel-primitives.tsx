import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ColumnHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 flex-none border-b border-line-subtle bg-panel px-panel-x py-bar-y">
      <h2 className="text-row font-semibold text-ink">{title}</h2>
    </div>
  );
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-line-subtle px-panel-x py-panel-y">
      <div className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-ink-faint">
        {title}
      </div>
      {children}
    </div>
  );
}

export function PanelEmpty({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-icon text-caption text-ink-faint">
      {Icon && <Icon aria-hidden="true" size={14} className="flex-none" />}
      {children}
    </div>
  );
}

export function ColumnEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-panel-x py-6 text-center text-row text-ink-faint">
      {children}
    </div>
  );
}
