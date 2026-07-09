// Mock data shared by the Header pickers and the Overview column while the
// real git/integration backends aren't wired up yet.

export interface MockTag {
  name: string
  date: string
}

export const TAGS: MockTag[] = [
  { name: "v2.4.0", date: "2026-06-28" },
  { name: "v2.3.1", date: "2026-06-10" },
  { name: "v2.3.0", date: "2026-05-30" },
  { name: "v2.2.2", date: "2026-05-12" },
  { name: "v2.2.1", date: "2026-04-29" },
  { name: "v2.2.0", date: "2026-04-15" },
  { name: "v2.1.0", date: "2026-03-22" },
  { name: "v2.0.1", date: "2026-03-02" },
  { name: "v2.0.0", date: "2026-02-20" },
  { name: "v2.0.0-rc.2", date: "2026-02-08" },
  { name: "v2.0.0-rc.1", date: "2026-01-27" },
  { name: "v1.9.3", date: "2026-01-10" },
  { name: "v1.9.2", date: "2025-12-18" },
  { name: "v1.9.1", date: "2025-12-02" },
  { name: "v1.9.0", date: "2025-11-20" },
  { name: "v1.8.0", date: "2025-10-30" },
]

export interface MockStash {
  index: number
  message: string
  branch: string
}

export const STASHES: MockStash[] = [
  { index: 0, message: "WIP header spacing tweaks", branch: "refactor/tailwind-migration" },
  { index: 1, message: "WIP commit box validation", branch: "feature/billing-v2" },
  { index: 2, message: "half-done retry logic", branch: "bugfix/24567-race-condition" },
  { index: 3, message: "WIP dark mode palette", branch: "feature/dark-mode" },
  { index: 4, message: "experiment: virtualized commit list", branch: "perf/bundle-splitting" },
  { index: 5, message: "WIP settings drawer layout", branch: "feature/notifications-center" },
  { index: 6, message: "temp: debug logging for auth", branch: "refactor/auth-module" },
  { index: 7, message: "WIP CSV column mapping", branch: "feature/export-csv" },
  { index: 8, message: "spike leftovers", branch: "spike/graphql-migration" },
  { index: 9, message: "WIP webhook signature check", branch: "feature/webhooks" },
  { index: 10, message: "unfinished i18n extraction", branch: "i18n/pt-br-support" },
  { index: 11, message: "WIP rate limiter middleware", branch: "feature/rate-limiting" },
  { index: 12, message: "draft e2e checkout flow", branch: "test/e2e-checkout" },
  { index: 13, message: "WIP audit log filters", branch: "feature/audit-log" },
  { index: 14, message: "old prototype, keep for reference", branch: "develop" },
]

export interface MockIssue {
  number: number
  title: string
  label: string
  state: "open" | "closed"
}

export const ISSUES: MockIssue[] = [
  { number: 352, title: "Branch list doesn't refresh after checkout", label: "bug", state: "open" },
  { number: 349, title: "Support GitLab as a remote provider", label: "enhancement", state: "open" },
  { number: 347, title: "Crash when repository path contains spaces", label: "bug", state: "open" },
  { number: 344, title: "Add keyboard shortcuts for staging files", label: "enhancement", state: "open" },
  { number: 341, title: "Commit log pagination loads duplicates", label: "bug", state: "open" },
  { number: 338, title: "Dark mode flashes white on startup", label: "bug", state: "open" },
  { number: 336, title: "Document the workspace REST API", label: "docs", state: "open" },
  { number: 333, title: "Slow diff rendering on files > 5k lines", label: "performance", state: "open" },
  { number: 330, title: "Allow signing commits with GPG", label: "enhancement", state: "open" },
  { number: 327, title: "Stash pop conflicts show no resolution UI", label: "bug", state: "open" },
  { number: 325, title: "Sanitize repository paths in error toasts", label: "security", state: "open" },
  { number: 322, title: "Add Portuguese translation", label: "i18n", state: "closed" },
  { number: 318, title: "Rebase interactive planner", label: "enhancement", state: "closed" },
  { number: 315, title: "Windows: CRLF warnings flood the console", label: "bug", state: "closed" },
  { number: 311, title: "Improve onboarding empty states", label: "design", state: "closed" },
  { number: 308, title: "Tag list ignores annotated tags", label: "bug", state: "closed" },
]

export interface MockPullRequest {
  number: number
  title: string
  author: string
  status: "open" | "draft"
}

export const PULL_REQUESTS: MockPullRequest[] = [
  { number: 148, title: "Add dark mode toggle to settings", author: "yurimelo", status: "open" },
  { number: 147, title: "Fix race condition in commit polling", author: "ana.dev", status: "open" },
  { number: 145, title: "Bump vite to v7", author: "dependabot", status: "open" },
  { number: 143, title: "Virtualize the commit list", author: "rafael.souza", status: "draft" },
  { number: 141, title: "Extract git CLI wrapper into its own crate", author: "yurimelo", status: "draft" },
  { number: 139, title: "Add stash apply/drop actions", author: "camila.reis", status: "open" },
  { number: 138, title: "Support SSH remotes with passphrase", author: "ana.dev", status: "open" },
  { number: 136, title: "Refactor workspace context boundaries", author: "pedro.lima", status: "draft" },
  { number: 134, title: "Show ahead/behind counts per branch", author: "camila.reis", status: "open" },
  { number: 132, title: "Add GPG commit signing", author: "rafael.souza", status: "open" },
  { number: 130, title: "Migrate icons to lucide", author: "yurimelo", status: "open" },
  { number: 128, title: "Improve error messages for detached HEAD", author: "pedro.lima", status: "draft" },
  { number: 126, title: "Add integration settings screen", author: "ana.dev", status: "open" },
  { number: 124, title: "Cache remote branch listing", author: "camila.reis", status: "open" },
  { number: 122, title: "Add Portuguese localization", author: "yurimelo", status: "open" },
]

export interface MockTeam {
  name: string
  members: number
}

export const TEAMS: MockTeam[] = [
  { name: "Platform", members: 8 },
  { name: "Frontend", members: 12 },
  { name: "Backend", members: 9 },
  { name: "Mobile", members: 5 },
  { name: "DevOps", members: 4 },
  { name: "QA", members: 6 },
  { name: "Security", members: 3 },
  { name: "Design Systems", members: 5 },
  { name: "Data Engineering", members: 7 },
  { name: "Infrastructure", members: 6 },
  { name: "Payments", members: 4 },
  { name: "Growth", members: 5 },
  { name: "Documentation", members: 2 },
  { name: "SRE", members: 4 },
  { name: "Release Engineering", members: 3 },
]

export interface MockIntegration {
  name: string
  connected: boolean
}

export const INTEGRATIONS: MockIntegration[] = [
  { name: "GitHub", connected: true },
  { name: "Jira", connected: true },
  { name: "Slack", connected: true },
  { name: "GitLab", connected: false },
  { name: "Bitbucket", connected: false },
  { name: "Azure DevOps", connected: false },
  { name: "Trello", connected: false },
  { name: "Microsoft Teams", connected: false },
  { name: "Jenkins", connected: true },
  { name: "CircleCI", connected: false },
  { name: "Sentry", connected: true },
  { name: "Linear", connected: false },
  { name: "Notion", connected: false },
  { name: "Confluence", connected: false },
  { name: "Asana", connected: false },
  { name: "Figma", connected: false },
]
