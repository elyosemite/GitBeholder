import { Icon } from "./Icon";
import type { IconName } from "./icon-paths";
import "./Header.css";

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

interface HeaderProps {
  workspaceName?: string;
  repositoryName?: string;
}

export function Header({ workspaceName, repositoryName }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__repo">
        <div className="app-header__logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b0e14" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.4" />
            <circle cx="6" cy="18" r="2.4" />
            <circle cx="18" cy="9" r="2.4" />
            <path d="M6 8.4v7.2M18 11.4c0 3-4 3-6 4.2" />
          </svg>
        </div>
        {repositoryName ? (
          <span className="app-header__repo-name">
            {workspaceName} / {repositoryName}
            <Icon name="chevronDown" size={13} color="var(--faint)" />
          </span>
        ) : (
          <span className="app-header__repo-name app-header__repo-name--empty">
            No repository selected
          </span>
        )}
      </div>

      <div className="app-header__actions">
        {GIT_ACTIONS.map((action) => (
          <span key={action.label} className="app-header__action-group">
            <button
              type="button"
              title={action.tooltip}
              className={
                "app-header__action" + (action.primary ? " app-header__action--primary" : "")
              }
            >
              <Icon name={action.icon} color={action.primary ? "#0b0e14" : "currentColor"} />
              <span>{action.label}</span>
              {action.caret && <Icon name="chevronDown" size={11} color="var(--faint)" />}
            </button>
            {action.dividerAfter && <span className="app-header__divider" />}
          </span>
        ))}
      </div>

      <div className="app-header__utilities">
        <div className="app-header__search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <span>Search everything</span>
          <span className="app-header__search-shortcut">⌘K</span>
        </div>
        <button type="button" title="Settings" className="app-header__icon-button">
          <Icon name="gear" size={16} />
        </button>
      </div>
    </header>
  );
}
