// Mock data shared by the Header pickers and the Overview column while the
// real git/integration backends aren't wired up yet.

import type { Repository } from "@/features/repositories"

const REPOSITORY_NAMES = [
  "GitBeholder",
  "api-gateway",
  "design-system",
  "mobile-app",
  "web-dashboard",
  "auth-service",
  "billing-service",
  "notification-service",
  "analytics-pipeline",
  "data-warehouse",
  "search-service",
  "recommendation-engine",
  "payments-core",
  "checkout-flow",
  "inventory-service",
  "shipping-service",
  "customer-support-portal",
  "admin-console",
  "marketing-site",
  "blog-cms",
  "docs-site",
  "developer-portal",
  "graphql-gateway",
  "rest-api-legacy",
  "websocket-server",
  "cron-jobs",
  "email-templates",
  "sms-gateway",
  "push-notifications",
  "feature-flags-service",
  "experimentation-platform",
  "observability-stack",
  "logging-pipeline",
  "metrics-collector",
  "tracing-service",
  "infra-terraform",
  "k8s-manifests",
  "ci-cd-pipelines",
  "design-tokens",
  "component-library",
  "storybook-addons",
  "testing-utils",
  "e2e-test-suite",
  "load-testing-tools",
  "security-scanner",
  "compliance-reports",
  "internal-cli",
  "sdk-javascript",
  "sdk-python",
  "sdk-go",
]

export const REPOSITORIES: Repository[] = REPOSITORY_NAMES.map((name, index) => ({
  id: index + 1,
  name,
  path: `C:\\Users\\Alfredo\\Projects\\${name}`,
  workspace_id: 1,
  folder_id: null,
}))

export interface MockBranch {
  name: string
  origin: boolean
}

export const BRANCHES: MockBranch[] = [
  { name: "main", origin: true },
  { name: "develop", origin: true },
  { name: "staging", origin: true },
  { name: "production", origin: true },
  { name: "release/v1.0.0", origin: true },
  { name: "release/v1.1.0", origin: true },
  { name: "release/v2.0.0-beta", origin: false },
  { name: "hotfix/payment-timeout", origin: true },
  { name: "hotfix/login-crash", origin: false },
  { name: "feature/user-onboarding", origin: true },
  { name: "feature/dark-mode", origin: true },
  { name: "feature/notifications-center", origin: false },
  { name: "feature/search-autocomplete", origin: true },
  { name: "feature/billing-v2", origin: false },
  { name: "feature/oauth-google", origin: true },
  { name: "feature/oauth-github", origin: true },
  { name: "feature/export-csv", origin: false },
  { name: "feature/import-wizard", origin: false },
  { name: "feature/multi-tenant", origin: true },
  { name: "feature/audit-log", origin: false },
  { name: "feature/rate-limiting", origin: true },
  { name: "feature/webhooks", origin: false },
  { name: "feature/2fa-support", origin: true },
  { name: "feature/team-invites", origin: false },
  { name: "feature/sso-saml", origin: true },
  { name: "bugfix/24234-null-pointer", origin: false },
  { name: "bugfix/24567-race-condition", origin: true },
  { name: "bugfix/25012-memory-leak", origin: false },
  { name: "bugfix/25089-timezone-offset", origin: true },
  { name: "bugfix/25190-broken-pagination", origin: false },
  { name: "chore/upgrade-deps", origin: true },
  { name: "chore/eslint-config", origin: false },
  { name: "chore/ci-pipeline", origin: true },
  { name: "chore/docker-optimize", origin: false },
  { name: "refactor/auth-module", origin: true },
  { name: "refactor/api-client", origin: false },
  { name: "refactor/state-management", origin: true },
  { name: "refactor/design-tokens", origin: false },
  { name: "docs/api-reference", origin: true },
  { name: "docs/contributing-guide", origin: false },
  { name: "test/e2e-checkout", origin: true },
  { name: "test/unit-coverage", origin: false },
  { name: "spike/graphql-migration", origin: false },
  { name: "spike/edge-functions", origin: false },
  { name: "perf/image-lazy-load", origin: true },
  { name: "perf/bundle-splitting", origin: false },
  { name: "security/dependency-audit", origin: true },
  { name: "security/csp-headers", origin: false },
  { name: "i18n/pt-br-support", origin: true },
  { name: "i18n/es-support", origin: false },
]

export const CURRENT_BRANCH = "main"

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

export type Platform = "github" | "gitlab" | "bitbucket" | "azure-devops"

export interface MockCommitRef {
  name: string
  type: "branch" | "tag"
  /** HEAD is on this branch */
  current?: boolean
  /** branch exists in the local clone */
  local?: boolean
  /** remote platform this ref is pushed to */
  platform?: Platform
}

export interface MockCommit {
  hash: string
  message: string
  author: string
  timestamp: string
  refs: MockCommitRef[]
}

export const COMMITS: MockCommit[] = [
  {
    hash: "04e336d",
    message: "feat(app): rebuild main window as 3-column layout on shadcn",
    author: "yurimelo",
    timestamp: "2026-07-09 10:12",
    refs: [{ name: "main", type: "branch", current: true, local: true, platform: "github" }],
  },
  {
    hash: "7849ab8",
    message: "feat(app): add sidebar actions for clone/init repository",
    author: "yurimelo",
    timestamp: "2026-07-09 09:41",
    refs: [{ name: "develop", type: "branch", local: true, platform: "github" }],
  },
  {
    hash: "3060efd",
    message: "chore(.gitignore): add entries for SQLite WAL files and temp directory",
    author: "ana.dev",
    timestamp: "2026-07-08 18:27",
    refs: [],
  },
  {
    hash: "985a8a3",
    message: "refactor(app): replace hand-rolled CSS with Tailwind v4",
    author: "yurimelo",
    timestamp: "2026-07-08 16:05",
    refs: [{ name: "v2.4.0", type: "tag", platform: "github" }],
  },
  {
    hash: "32b5ac4",
    message: "feat(app): add light theme via prefers-color-scheme",
    author: "camila.reis",
    timestamp: "2026-07-08 11:48",
    refs: [],
  },
  {
    hash: "8df646f",
    message: "refactor(app): move CSS vars to a semantic color-token system",
    author: "camila.reis",
    timestamp: "2026-07-07 17:33",
    refs: [{ name: "feature/dark-mode", type: "branch", local: true }],
  },
  {
    hash: "6f47c03",
    message: "Merge pull request #38 from elyosemite/feature/desktop-app-scaffold",
    author: "pedro.lima",
    timestamp: "2026-07-07 15:20",
    refs: [],
  },
  {
    hash: "b3e91d2",
    message: "feat(api): add stash list endpoint",
    author: "ana.dev",
    timestamp: "2026-07-07 10:02",
    refs: [{ name: "feature/webhooks", type: "branch", platform: "gitlab" }],
  },
  {
    hash: "e51c8aa",
    message: "fix(git): handle repository paths containing spaces",
    author: "rafael.souza",
    timestamp: "2026-07-06 19:44",
    refs: [],
  },
  {
    hash: "9d04f7b",
    message: "perf(log): stream git log output instead of buffering",
    author: "rafael.souza",
    timestamp: "2026-07-06 14:11",
    refs: [{ name: "perf/image-lazy-load", type: "branch", local: true, platform: "bitbucket" }],
  },
  {
    hash: "c7a2e19",
    message: "chore(deps): bump vite from 7.2.1 to 7.3.6",
    author: "dependabot",
    timestamp: "2026-07-06 08:00",
    refs: [],
  },
  {
    hash: "f82d3c4",
    message: "feat(auth): support SSH remotes with passphrase",
    author: "ana.dev",
    timestamp: "2026-07-05 22:36",
    refs: [{ name: "v2.3.1", type: "tag" }],
  },
  {
    hash: "1a9be07",
    message: "fix(ui): dark mode flashes white on startup",
    author: "camila.reis",
    timestamp: "2026-07-05 16:58",
    refs: [],
  },
  {
    hash: "d63f0e8",
    message: "refactor(core): extract git CLI wrapper into its own crate",
    author: "yurimelo",
    timestamp: "2026-07-05 11:23",
    refs: [{ name: "refactor/auth-module", type: "branch", local: true, platform: "azure-devops" }],
  },
  {
    hash: "42c7d91",
    message: "test(e2e): cover checkout flow with conflicting stash",
    author: "pedro.lima",
    timestamp: "2026-07-04 20:15",
    refs: [],
  },
  {
    hash: "a08e5f3",
    message: "docs(api): document the workspace REST API",
    author: "pedro.lima",
    timestamp: "2026-07-04 13:52",
    refs: [{ name: "docs/api-reference", type: "branch", platform: "github" }],
  },
  {
    hash: "5b1d9c0",
    message: "fix(log): pagination loads duplicate commits",
    author: "rafael.souza",
    timestamp: "2026-07-03 18:40",
    refs: [],
  },
  {
    hash: "e94a2b6",
    message: "feat(i18n): add Portuguese translation",
    author: "yurimelo",
    timestamp: "2026-07-03 09:17",
    refs: [{ name: "i18n/pt-br-support", type: "branch", local: true, platform: "github" }],
  },
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
