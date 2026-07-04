import { Icon } from "./Icon";
import type { IconName } from "./icon-paths";

interface GitAction {
  label: string;
  tooltip: string;
  icon: IconName;
  primary?: boolean;
  caret?: boolean;
  dividerAfter?: boolean;
}

// Wired to no-ops for now — these become real Git operations once the
// corresponding API endpoints exist (push/pull/stash/merge/rebase, etc.
// are not implemented on the backend yet).
const GIT_ACTIONS: GitAction[] = [
  { label: "Fetch", tooltip: "Fetch from origin", icon: "down" },
  { label: "Pull", tooltip: "Pull changes", icon: "down", caret: true },
  { label: "Push", tooltip: "Push to origin", icon: "up", caret: true, primary: true },
  { label: "Commit", tooltip: "Commit staged changes", icon: "check", caret: true, dividerAfter: true },
  { label: "Stash", tooltip: "Stash working changes", icon: "box" },
  { label: "Pop", tooltip: "Pop latest stash", icon: "pop" },
  { label: "Merge", tooltip: "Merge branch", icon: "merge", caret: true, dividerAfter: true },
  { label: "Rebase", tooltip: "Rebase onto…", icon: "rebase", caret: true },
  { label: "Cherry Pick", tooltip: "Cherry-pick commit", icon: "cherry" },
  { label: "Sync", tooltip: "Fetch, pull & push", icon: "sync" },
];

const ACTION_BASE =
  "flex items-center gap-1.5 h-[34px] px-[11px] border border-transparent rounded-lg font-sans text-[12.5px] cursor-pointer whitespace-nowrap transition-colors duration-150";
const ACTION_DEFAULT = "bg-transparent text-ink font-medium hover:bg-surface-hover";
const ACTION_PRIMARY =
  "bg-[linear-gradient(180deg,var(--color-accent-from),var(--color-accent-to))] text-on-accent font-semibold shadow-[0_3px_10px_var(--color-accent-glow)] hover:brightness-[1.08]";

interface HeaderProps {
  workspaceName?: string;
  repositoryName?: string;
}

export function Header({ workspaceName, repositoryName }: HeaderProps) {
  return (
    <header className="h-[68px] flex-none flex items-center gap-4 px-4 bg-[linear-gradient(180deg,var(--color-header-start),var(--color-header-end))] border-b border-line-default relative z-20">
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="w-[34px] h-[34px] flex-none rounded-[9px] bg-[linear-gradient(145deg,var(--color-brand-from),var(--color-brand-to))] flex items-center justify-center shadow-[0_4px_14px_var(--color-brand-glow)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.4" />
            <circle cx="6" cy="18" r="2.4" />
            <circle cx="18" cy="9" r="2.4" />
            <path d="M6 8.4v7.2M18 11.4c0 3-4 3-6 4.2" />
          </svg>
        </div>
        {repositoryName ? (
          <span className="flex items-center gap-[7px] font-semibold text-sm tracking-[-0.01em] whitespace-nowrap">
            {workspaceName} / {repositoryName}
            <Icon name="chevronDown" size={13} color="var(--color-ink-faint)" />
          </span>
        ) : (
          <span className="flex items-center gap-[7px] font-normal text-sm tracking-[-0.01em] whitespace-nowrap text-ink-faint">
            No repository selected
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center gap-0.5 bg-surface border border-line-default rounded-[11px] p-[5px] overflow-x-auto">
        {GIT_ACTIONS.map((action) => (
          <span key={action.label} className="flex items-center">
            <button
              type="button"
              title={action.tooltip}
              className={ACTION_BASE + " " + (action.primary ? ACTION_PRIMARY : ACTION_DEFAULT)}
            >
              <Icon name={action.icon} color={action.primary ? "var(--color-on-accent)" : "currentColor"} />
              <span>{action.label}</span>
              {action.caret && <Icon name="chevronDown" size={11} color="var(--color-ink-faint)" />}
            </button>
            {action.dividerAfter && <span className="w-px h-[22px] bg-line-default mx-1" />}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 min-w-[220px] justify-end">
        <div className="flex items-center gap-2 bg-surface border border-line-subtle rounded-[9px] py-[7px] px-[10px] w-[180px] text-ink-faint text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span>Search everything</span>
          <span className="ml-auto font-mono text-[10px] text-ink-faint border border-line-default rounded px-1">⌘K</span>
        </div>
        <button
          type="button"
          title="Settings"
          className="w-9 h-9 flex-none rounded-[9px] bg-surface border border-line-subtle flex items-center justify-center cursor-pointer text-ink-secondary hover:bg-surface-hover hover:text-ink"
        >
          <Icon name="gear" size={16} />
        </button>
      </div>
    </header>
  );
}
