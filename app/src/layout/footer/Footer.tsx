import { Minus, Plus, type LucideIcon } from "lucide-react";
import { useSession } from "@/features/session";
import { useZoom } from "@/lib/hooks/useZoom";

function ZoomButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-full items-center px-1 text-ink-faint transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon aria-hidden="true" size={12} />
    </button>
  );
}

export function Footer({ zoom }: { zoom: ReturnType<typeof useZoom> }) {
  const { repository } = useSession();

  return (
    <footer className="flex h-6 flex-none items-center justify-between border-t border-line-subtle bg-panel px-bar-x text-meta text-ink-faint">
      <span className="truncate">{repository?.name ?? "No repository"}</span>

      <div className="flex h-4 flex-none items-center divide-x divide-line-subtle border border-line-subtle">
        <ZoomButton icon={Minus} label="Zoom out" disabled={!zoom.canZoomOut} onClick={zoom.zoomOut} />
        <span className="px-1.5 font-mono tabular-nums">{zoom.zoom}%</span>
        <ZoomButton icon={Plus} label="Zoom in" disabled={!zoom.canZoomIn} onClick={zoom.zoomIn} />
      </div>
    </footer>
  );
}
