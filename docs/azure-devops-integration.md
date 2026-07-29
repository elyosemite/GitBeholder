# Integração com Azure DevOps

Documenta o que foi implementado das issues [#48](https://github.com/elyosemite/GitBeholder/issues/48)
(backend, fechada) e [#49](https://github.com/elyosemite/GitBeholder/issues/49)
(frontend), parte do epic [#47](https://github.com/elyosemite/GitBeholder/issues/47).
A proposta original/domain model completo está em
`docs/proposals/work-item-integrations.md` — este documento cobre só o que
existe hoje no código, não o escopo futuro (busca de work items, badge no
commit, auto-close no merge, outros providers).

## O que existe

Uma Repository pode ser conectada a uma organização/projeto do Azure DevOps
via Personal Access Token (PAT). A conexão é testável antes de salvar,
consultável e desconectável — tudo pela seção **Integrations** do
`RepositoryOverviewColumn`, sem tela de settings dedicada (decisão explícita:
o dono do repo pediu para ficar ali mesmo, em vez de criar uma navegação
nova).

## Backend (issue #48)

- `integrations` (migration): `repository_id`, `provider`, `config` (map:
  `org_url`, `project`), `credentials` (binário criptografado via
  `Plug.Crypto` — nunca sai em texto puro), `enabled`,
  `auto_close_enabled` (default `false`), `auto_close_target_state`
  (nullable). Os campos de auto-close existem no schema mas não têm UI
  ainda (ver "Deixado de fora").
- `GitBeholder.Integrations` (contexto): `connect/2`, `test_connection/1`
  (não persiste), `get_connection/1`, `disconnect/1`.
- `GitBeholder.Integrations.WorkItemProvider` (behaviour): contrato comum
  para providers futuros (`list_types/1`, `search_items/2`, `get_item/2`,
  `transition_item/3`, `link_commit/3`) — só `list_types/1` é usado hoje.
- `GitBeholder.Integrations.AzureDevOps`: implementa `list_types/1` contra
  `GET _apis/wit/workitemtypes` via `Finch`. Mapeia falhas para
  `{:error, :invalid_token}` / `{:error, :connection_failed}` /
  `{:error, :not_found}` / `{:error, :invalid_response}`.
- Testado via `Mox` em `test/git_beholder/integrations/azure_devops_test.exs`
  (PAT válido, inválido/expirado, org inalcançável).

### Rotas

```
POST   /api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops
POST   /api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops/test
GET    /api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops
DELETE /api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops
```

Documentadas na collection Postman **GitBeholder** (workspace **Open
Source**), pasta *Azure DevOps* — nenhuma rota nova foi criada pelo trabalho
do frontend, então a collection não precisou de atualização.

## Frontend (issue #49)

### `features/integrations/`

Segue o mesmo formato de toda feature do app (`api.ts` / `types.ts` /
`hooks/` / `index.ts` — ver `docs/frontend-architecture.md`):

- `types.ts`: `AzureDevOpsConfig`, `Integration`, `ConnectAzureDevOpsPayload`.
- `api.ts`: `getAzureDevOpsIntegration` (um 404 vira `null` — "não
  conectado" é estado normal, não erro), `testAzureDevOpsConnection`,
  `connectAzureDevOps`, `disconnectAzureDevOps`.
- `hooks/useAzureDevOpsIntegration.ts`: hook de leitura, mesmo padrão de
  `useBranches` — `useApiData` chaveado em
  `[repository?.id, revisions.integrations]`.
- `hooks/useConnectAzureDevOps.ts`, `useTestAzureDevOpsConnection.ts`,
  `useDisconnectAzureDevOps.ts`: hooks de mutação; connect/disconnect
  chamam `invalidate("integrations")` ao final, test não (não persiste
  nada).

### Mudanças em código compartilhado

- `features/session/types.ts` e `revisions.ts`: novo escopo
  `"integrations"` em `DataScope`/`initialRevisions`.
- `lib/api-client.ts`: `request()` agora trata `204 No Content` (resolve
  `undefined` em vez de chamar `.json()`, que quebraria em corpo vazio) —
  necessário porque `disconnect` foi o primeiro endpoint do app a
  responder 204.

### `ConnectAzureDevOpsDialog`

`app/src/layout/columns/ConnectAzureDevOpsDialog.tsx`. Mesmo padrão de
`CloneRepositoryDialog`: `{ open, onOpenChange }` controlado, estado local
(`useState`) por campo, erro inline (`text-caption text-danger`), sem
biblioteca de toast (o app não usa nenhuma — ver decisão abaixo).

Campos: Organization URL, Project, Personal access token (`type="password"`,
mascarado). O botão **Save** só destrava depois de **Test connection**
suceder; editar qualquer campo depois de um teste bem-sucedido re-trava o
Save (as credenciais salvas precisam ser as mesmas testadas).

### `RepositoryOverviewColumn`

A linha "Azure DevOps" dentro da seção **Integrations** deixou de ser mock:
usa `useAzureDevOpsIntegration()` para saber se está conectado, mostra
`PlatformIcon platform="azure-devops"` em vez do avatar de iniciais, e um
botão **Connect…** (abre o dialog) ou **Disconnect** conforme o estado. As
outras linhas da seção (GitHub, Jira etc.) continuam mockadas — só a Azure
DevOps foi implementada, por ser a única com backend real.

## Decisões e coisas deixadas de fora

- **Sem toggle de auto-close nesta v1.** A issue #49 não pede isso
  explicitamente (só a #47, o epic, menciona); o backend já aceita
  `auto_close_enabled`/`auto_close_target_state`, então expor isso depois é
  aditivo, não retrabalho.
- **Erros via toast (shadcn `sonner`), não mais inline.** A issue #49 pedia
  toasts; a v1 tinha ficado inline porque o app não tinha nenhuma lib de
  toast instalada. Resolvido instalando o componente `sonner` do registry
  do shadcn (`pnpm dlx shadcn@latest add sonner`) — mesma fonte dos outros
  componentes em `app/src/components/ui/`, então não quebra a convenção de
  "sem lib de UI fora do shadcn". `<Toaster />` montado uma vez em
  `App.tsx`; os erros de connect/test/disconnect chamam `toast.error(...)`.
  O componente gerado vinha acoplado a `next-themes` (`useTheme()`) para
  decidir light/dark, mas o app não tem `ThemeProvider` nenhum — troquei
  por `theme="system"` fixo (o próprio `sonner` já resolve dark/light via
  `prefers-color-scheme` nesse modo) e removi a dependência `next-themes`
  do `package.json`, que tinha sido adicionada automaticamente pelo CLI do
  shadcn e ficaria sem uso.
- **Sem tela de settings dedicada.** A issue #49 original imaginava uma
  "primeira tela de settings do repositório"; a implementação ficou dentro
  do `RepositoryOverviewColumn` existente, por instrução direta do
  dono do repositório.

## Como testar manualmente

1. Suba o backend (`mix phx.server`, feito manualmente) e o app.
2. Selecione um repositório → seção **Integrations** → **Connect…**.
3. Preencha Organization URL / Project / PAT → **Test connection**.
4. Se o teste passar, **Save** destrava → salva a conexão.
5. A linha deve virar "Connected" com ação **Disconnect**.
6. **Disconnect** deve reverter a linha para "Connect…".
