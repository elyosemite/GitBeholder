# Arquitetura do Frontend (app/)

Este documento define como o código do desktop app (`app/src`) é organizado,
quais são as regras de dependência entre as camadas e — principalmente — como
partes que parecem independentes (Overview, Commits, Changes, Header) se
mantêm sincronizadas quando algo muda: selecionar um repositório, trocar de
branch, fazer push/pull ou commit.

## 1. Estrutura de diretórios

```
src/
├── components/          # genérico e reutilizável, sem conhecimento de domínio
│   ├── ui/              # shadcn — o CLI escreve aqui (components.json); não mover
│   ├── icons/           # brand-icons.tsx (PlatformIcon etc.)
│   └── panel-primitives.tsx
│
├── layout/              # o esqueleto basilar da janela
│   ├── AppShell.tsx     # grid de 3 colunas + header
│   ├── header/
│   │   ├── Header.tsx
│   │   ├── RepositoryBlock.tsx
│   │   ├── BranchBlock.tsx
│   │   ├── GitOperationBlock.tsx
│   │   └── SearchBlock.tsx
│   └── columns/
│       ├── RepositoryOverviewColumn.tsx
│       ├── CommitsColumn.tsx
│       └── ChangesColumn.tsx
│
├── features/            # slices verticais, cada uma autocontida
│   ├── session/         # ⭐ estado compartilhado: repo/branch atuais + invalidação
│   ├── repositories/    # buscar, listar, selecionar repositórios
│   ├── branches/        # listar branches, checkout
│   ├── commits/         # log de commits
│   ├── staging/         # status, stage/unstage, commit
│   └── git-ops/         # push, pull, fetch, stash
│       └── (cada uma)   # api.ts, hooks/, components/, context/, types.ts, index.ts
│
├── lib/
│   ├── utils.ts         # cn() — caminho esperado pelo shadcn
│   ├── api-client.ts    # fetch wrapper compartilhado (request<T>)
│   └── hooks/           # hooks genéricos (useApiData, useDebounce…)
│
├── mocks/               # dados fake; somem conforme as features assumem
├── App.tsx              # monta providers + <AppShell/>
└── main.tsx
```

### Papel de cada camada

| Camada       | Responsabilidade                                            | Pode importar de            |
| ------------ | ----------------------------------------------------------- | --------------------------- |
| `components` | UI genérica (botão, badge, primitivas de painel, ícones)     | `lib`                       |
| `features`   | Domínio: dados, estado, regras e componentes daquele slice   | `components`, `lib`, outras features **somente via barrel** |
| `layout`     | Posicionar as features na janela (colunas, header, resize)   | `features`, `components`, `lib` |
| `App`        | Composição: providers globais + shell                        | tudo                        |

Regras práticas:

- **Import profundo em outra feature é proibido.** `@/features/branches` (barrel)
  ✅ · `@/features/branches/hooks/useBranches` a partir de `commits` ❌. O barrel
  (`index.ts`) é o contrato público da feature; o resto é implementação.
- **`layout` não busca dados.** Coluna é casca: posição, largura, scroll,
  resize. O miolo (lista de commits, lista de arquivos) vem de
  `features/*/components`.
- **Nada de diretórios globais `types/`, `hooks/`, `api/`** que crescem sem
  dono. Tipo de commit mora em `features/commits/types.ts`. Só o que é
  realmente transversal (fetch wrapper, `useApiData`) vive em `lib/`.

## 2. O problema central: propagação de mudanças

As colunas parecem independentes, mas formam um grafo de dependência:

```
                    ┌────────────────────────────────┐
  seleciona repo ──►│  SESSÃO (repo atual, branch)   │◄── checkout de branch
                    └───────────────┬────────────────┘
                                    │  (toda leitura depende disso)
            ┌───────────────┬───────┴────────┬─────────────────┐
            ▼               ▼                ▼                 ▼
      OverviewColumn   CommitsColumn    ChangesColumn    Header (blocks)
      branches, tags,  log da branch    status/staging   picker de repo,
      PRs, stashes     atual            do repo atual    branch, push/pull
```

E as **mutações** realimentam o grafo:

| Ação            | Executa sobre              | Precisa atualizar depois                          |
| --------------- | -------------------------- | ------------------------------------------------- |
| Selecionar repo | —                          | TUDO (todas as colunas + header)                  |
| Checkout branch | repo atual                 | commits, status/changes, overview (branch "atual") |
| Commit          | repo atual + branch atual  | commits, status/changes, ahead/behind             |
| Push            | **branch atual**           | commits (decorations), branches remotas, ahead/behind |
| Pull            | **branch atual**           | commits, status/changes, branches, stashes?       |
| Stash / pop     | repo atual                 | status/changes, stashes                           |

Duas conclusões saem dessa tabela:

1. Existe um **estado de sessão** pequeno e compartilhado — *qual repositório*
   e *qual branch* estão ativos — que quase tudo lê e pouquíssimos lugares
   escrevem. Ele não pertence a nenhuma coluna: pertence a uma feature própria
   (`features/session`).
2. Mutações git precisam de um meio de dizer "os dados X ficaram velhos"
   sem conhecer quem os consome. Isso é **invalidação por escopo**, não
   chamada direta entre componentes.

## 3. A feature `session`

`features/session` é a feature de coordenação. Guarda o estado compartilhado
e o mecanismo de invalidação. É a única dependência comum entre as demais.

```tsx
// features/session/context.tsx
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Repository } from "@/features/repositories";

// Escopos de dados que podem ficar obsoletos após uma mutação.
export type DataScope = "commits" | "status" | "branches" | "stashes" | "tags";

interface SessionState {
  repository: Repository | null;
  branch: string | null;
  /** contador por escopo; mudar o número força re-fetch de quem depende dele */
  revisions: Record<DataScope, number>;
}

interface SessionApi extends SessionState {
  selectRepository: (repo: Repository) => void;
  setBranch: (branch: string) => void;
  /** marca escopos como obsoletos — quem consome re-busca sozinho */
  invalidate: (...scopes: DataScope[]) => void;
}

const SessionContext = createContext<SessionApi | null>(null);

const initialRevisions: SessionState["revisions"] = {
  commits: 0, status: 0, branches: 0, stashes: 0, tags: 0,
};

function bump(revisions: SessionState["revisions"], ...scopes: DataScope[]) {
  const next = { ...revisions };
  for (const scope of scopes) next[scope] += 1;
  return next;
}

function bumpAll(revisions: SessionState["revisions"]) {
  return bump(revisions, ...(Object.keys(revisions) as DataScope[]));
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    repository: null,
    branch: null,
    revisions: initialRevisions,
  });

  const selectRepository = useCallback((repository: Repository) => {
    // trocar de repo zera a branch (será resolvida pelo HEAD do novo repo)
    // e invalida tudo de uma vez
    setState((s) => ({
      repository,
      branch: null,
      revisions: bumpAll(s.revisions),
    }));
  }, []);

  const setBranch = useCallback((branch: string) => {
    setState((s) => ({
      ...s,
      branch,
      revisions: bump(s.revisions, "commits", "status"),
    }));
  }, []);

  const invalidate = useCallback((...scopes: DataScope[]) => {
    setState((s) => ({ ...s, revisions: bump(s.revisions, ...scopes) }));
  }, []);

  const value = useMemo(
    () => ({ ...state, selectRepository, setBranch, invalidate }),
    [state, selectRepository, setBranch, invalidate],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession requer <SessionProvider>");
  return ctx;
}
```

```ts
// features/session/index.ts  (barrel — contrato público)
export { SessionProvider, useSession } from "./context";
export type { DataScope } from "./context";
```

O `App.tsx` fica só composição:

```tsx
function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}
```

> **Por que contador de revisão e não callback/evento?** Porque encaixa no
> modelo do React: o consumidor declara `revisions.commits` como dependência
> do seu fetch e re-busca quando muda. Não há registro/desregistro de
> listeners, não há risco de leak, e um novo consumidor futuro só precisa ler
> o contexto. Se o app crescer para cache com dedupe/retry/optimistic update,
> o caminho natural é trocar esse mecanismo por **TanStack Query**
> (`queryKey = [repoId, branch, "commits"]`, `queryClient.invalidateQueries`)
> sem mudar a arquitetura — só a implementação da invalidação.

## 4. Exemplo completo: feature `repositories` (buscar e selecionar)

O requisito não é só listar: buscar, selecionar e **fazer todo o resto do app
reagir** à seleção.

### 4.1 Anatomia

```
features/repositories/
├── api.ts            # chamadas HTTP desta feature
├── types.ts          # Repository, Workspace
├── hooks/
│   └── useRepositorySearch.ts
├── components/
│   └── RepositoryPicker.tsx   # combobox usado pelo header
└── index.ts          # barrel
```

### 4.2 API e tipos

```ts
// features/repositories/types.ts
export interface Repository {
  id: number;
  name: string;
  path: string;
  workspace_id: number;
}
```

```ts
// features/repositories/api.ts
import { request } from "@/lib/api-client";
import type { Repository } from "./types";

export function searchRepositories(workspaceId: number, query: string) {
  return request<{ repositories: Repository[] }>(
    `/workspaces/${workspaceId}/repositories?q=${encodeURIComponent(query)}`,
  );
}
```

### 4.3 Hook de busca

```ts
// features/repositories/hooks/useRepositorySearch.ts
import { useApiData } from "@/lib/hooks/useApiData";
import { searchRepositories } from "../api";

export function useRepositorySearch(workspaceId: number | null, query: string) {
  return useApiData(
    () =>
      workspaceId === null
        ? Promise.resolve([])
        : searchRepositories(workspaceId, query).then((r) => r.repositories),
    [workspaceId, query],
  );
}
```

### 4.4 O componente escreve na sessão — e é SÓ isso que ele faz

```tsx
// features/repositories/components/RepositoryPicker.tsx
import { useSession } from "@/features/session";
import { useRepositorySearch } from "../hooks/useRepositorySearch";

export function RepositoryPicker() {
  const { repository, selectRepository } = useSession();
  const [query, setQuery] = useState("");
  const { data: results } = useRepositorySearch(currentWorkspaceId, query);

  return (
    <Combobox
      value={repository}
      options={results ?? []}
      onSearch={setQuery}
      onSelect={selectRepository}   // ← única linha de "integração"
    />
  );
}
```

O picker **não conhece** CommitsColumn, ChangesColumn nem Overview. Ele só
escreve na sessão. A propagação acontece do lado de quem lê:

### 4.5 Consumidores reagem sozinhos

```ts
// features/commits/hooks/useCommits.ts
import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listCommits } from "../api";

export function useCommits() {
  const { repository, branch, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listCommits(repository.workspace_id, repository.id, branch),
    // re-busca quando: troca repo, troca branch, ou alguém invalidou "commits"
    [repository?.id, branch, revisions.commits],
  );
}
```

```tsx
// layout/columns/CommitsColumn.tsx — a coluna é casca
import { CommitList } from "@/features/commits";

export function CommitsColumn() {
  return (
    <ColumnShell title="Commits" resizable>
      <CommitList />   {/* usa useCommits() internamente */}
    </ColumnShell>
  );
}
```

O mesmo padrão vale para `features/staging` (lê `repository` + `revisions.status`),
`features/branches` (lê `repository` + `revisions.branches`) e para o Overview
(compõe hooks de várias features).

### 4.6 Push/pull na branch atual + invalidação

Mutações leem a sessão para saber **onde** agir e invalidam escopos ao final:

```ts
// features/git-ops/hooks/usePush.ts
import { useSession } from "@/features/session";
import { push } from "../api";

export function usePush() {
  const { repository, branch, invalidate } = useSession();

  return async function pushCurrentBranch() {
    if (!repository || !branch) throw new Error("nenhum repo/branch ativo");

    await push(repository.workspace_id, repository.id, branch); // ← branch ATUAL

    // commits ganham decoration de remote, ahead/behind muda,
    // branch remota pode ter sido criada:
    invalidate("commits", "branches");
  };
}
```

```tsx
// layout/header/GitOperationBlock.tsx
const pushCurrentBranch = usePush();
<Button onClick={pushCurrentBranch}>Push</Button>
```

### 4.7 A sequência inteira, ponta a ponta

```
usuário digita no picker
  → useRepositorySearch re-busca (estado local da feature)
usuário seleciona "GitBeholder"
  → selectRepository() escreve na sessão e dá bump em TODAS as revisions
    → useCommits    re-busca  → CommitsColumn re-renderiza
    → useStatus     re-busca  → ChangesColumn re-renderiza
    → useBranches   re-busca  → OverviewColumn + BranchBlock re-renderizam
                                 (BranchBlock resolve o HEAD e chama setBranch)
usuário clica Push
  → usePush() lê { repository, branch } da sessão → POST /push (branch atual)
  → invalidate("commits", "branches")
    → useCommits e useBranches re-buscam; useStatus NÃO (não foi invalidado)
```

## 5. Resumo das regras

1. **Estado de sessão** (repo atual, branch atual) mora em `features/session`,
   não em nenhuma coluna. Escreve quem seleciona; lê quem precisa.
2. **Server state por feature**: cada feature busca seus dados com hooks
   próprios, sempre parametrizados pela sessão.
3. **Mutação nunca chama componente**: executa a operação (na branch atual,
   lida da sessão) e invalida escopos. Quem lê o escopo re-busca sozinho.
4. **Colunas do layout são cascas**; o conteúdo vem de `features/*/components`.
5. **Comunicação entre features só via barrel** (`@/features/x`), nunca por
   import profundo.
6. Se a necessidade de cache crescer (dedupe, retry, optimistic updates),
   migrar a invalidação para TanStack Query mantendo os mesmos hooks públicos.
