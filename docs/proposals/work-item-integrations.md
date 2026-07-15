# Work Item Integrations — Requirements

Status: draft, pending breakdown via `/to-issues` and `/to-prd`.

Goal: let GitBeholder connect to external work item trackers (Azure DevOps first,
then GitHub/GitLab/Jira/Linear/Bitbucket), link commits to work items, and
eventually auto-close linked work items when a merge happens in the app. Editor
integrations (VS Code, JetBrains) and AI/LLM integrations (bring-your-own-LLM
analysis and commit assistance, AI agent management) are related future work
tracked separately but share the same "integrations" surface.

## Decisions locked for v1

- **Auth**: Personal Access Token (PAT) only. No OAuth in v1 — avoids registering
  a Microsoft Entra ID app and handling Tauri deep-link redirects for a first
  integration.
- **Commit ↔ work item linking**: explicit visual picker in the commit UI (not
  the `AB#123` message-convention shortcut). Better discoverability; user
  doesn't need to know IDs.
- **Auto-close trigger**: deferred until GitBeholder has a merge feature.
  v1 ships connection + search + linking, with the auto-close rule visible
  but inactive ("activates once merge is available").

## Cross-provider foundation (applies to every future provider)

- Internal contract: a `WorkItemProvider` behaviour in Elixir with
  `list_types/1`, `search_items/2`, `get_item/2`, `transition_item/3`,
  `link_commit/3`. Azure DevOps, GitHub Issues, Jira, Linear, etc. all
  implement this same interface — this is what lets future providers plug in
  without reopening the UI.
- An integration connection is scoped **per repository**, not per workspace —
  each repo can point at a different org/project.
- The auto-close rule is **configurable per repository**: provider enabled +
  target state (e.g. "Closed" vs "Resolved" — teams differ) + trigger event.
  We persist this rule now even though it stays inactive until merge exists.
- Credentials (PAT for now) are stored encrypted and never sent back to the
  frontend after saving — only a "connected" indicator is exposed.

## Azure DevOps v1 — functional requirements

- **Connect**: Org URL + Project + PAT. A "Test connection" action validates
  via `GET _apis/wit/workitemtypes` before saving.
- **Work item types per process**: fetched dynamically (Epic/Feature/User
  Story/Task/Bug vary by process template — must not be hardcoded).
- **Search/list**: via WIQL, with basic filters (assigned to me, state,
  iteration/sprint) feeding the picker.
- **Link commit ↔ work item**: saving a link stores it locally *and* calls the
  Azure DevOps work item relations API (`ArtifactLink`) so the commit also
  shows up on the Azure Boards side — without this, the link is invisible to
  anyone who only uses Azure DevOps.
- **State transition** (built now, only triggered once merge exists): `PATCH`
  the work item to the configured state + add a comment referencing the
  commit/branch.
- **Explicit error handling**: invalid/expired PAT, work item not found, state
  transition rejected by process rules (not every state allows a direct jump
  to "Closed") — always surfaced with an actionable message, never a silent
  failure.

## Architecture (follows the existing module → controller → route pattern)

- `lib/git_beholder/integrations/` (context) +
  `lib/git_beholder/integrations/azure_devops.ex`
- New migrations:
  - `integrations` table: `repository_id`, `provider`, `config`, encrypted
    credentials, `enabled`
  - `work_item_links` table: `commit_sha`, `repository_id`, `provider`,
    `external_id`, `type`, cached `title`, `url`
- Routes under
  `/api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops/...`
- Frontend: `app/src/features/integrations/` mirroring the existing feature
  folders (`api.ts`, `types.ts`, `hooks/`)

## UI requirements

1. **Integrations panel** — new destination in repository settings (no
   settings screen exists yet; this would be the first one). Lists providers
   using the brand icons that already exist (`PlatformIcon`), each showing
   connected/disconnected state.
2. **"Connect Azure DevOps" dialog** — follows the pattern of existing dialogs
   (`CloneRepositoryDialog`, etc.): Org URL / Project / PAT (masked) fields,
   "Test connection" button, Save.
3. **Auto-close rule** — inside the same panel: a "Close work item on merge"
   toggle + target-state select. Visible but with a note: "activates once
   merge is available".
4. **Work item picker** — a searchable combobox reusing `cmdk`, attached to the
   commit creation panel (`ChangesColumn`/staging area), with an icon per type
   (Epic/Feature/User Story/Task/Bug), ID, and title.
5. **Link badge** — in the commit log (`CommitsColumn`) and commit detail, a
   small chip like "AB#123 · User Story", clickable to open in the browser.
6. **Error feedback** — toasts for connection failure, invalid token, rejected
   state transition.

## Explicitly out of scope for v1

OAuth, automatic triggering (waits on merge), other providers (GitHub, GitLab,
Jira, Linear, Bitbucket), editor integrations (VS Code, JetBrains), and the
LLM/AI-agent integrations. All of these reuse the foundation above, but land
after the Azure DevOps integration validates the pattern.
