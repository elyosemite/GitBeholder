# Integrações com Work Items — Requisitos

Status: rascunho, pendente de detalhamento via `/to-issues` e `/to-prd`.

Objetivo: permitir que o GitBeholder se conecte a rastreadores de work items
externos (Azure DevOps primeiro, depois GitHub/GitLab/Jira/Linear/Bitbucket),
vincule commits a work items e, eventualmente, feche automaticamente work
items vinculados quando um merge acontecer no app. Integrações com editores
(VS Code, JetBrains) e integrações de IA/LLM (análise e assistência de commit
com LLM próprio, gerenciamento de agentes de IA) são trabalho futuro
relacionado, rastreado separadamente, mas compartilham a mesma superfície de
"integrações".

## Modelo de domínio (conceitos e relacionamentos)

Termos genéricos usados nesta proposta, independentes de provider — cada
provider (Azure DevOps, Jira, GitHub, GitLab, Linear) mapeia esses conceitos
de forma diferente; ver tabela de mapeamento abaixo.

- **Organization** — tenant do cliente no provider (ex: "Google"). Tem muitos
  `Project`.
- **Project** — subdivisão de trabalho dentro da Organization (ex: "DevOps",
  "Backend", "Database Admin"). Pertence a uma `Organization`. Tem muitos
  `Team` e muitos `Item`.
  - Nome escolhido deliberadamente para não colidir com o `Workspace` que já
    existe no GitBeholder (`lib/git_beholder/repositories/workspace.ex`), que
    agrupa repositórios locais e não tem relação com este domínio.
- **Team** — agrupa commiters/maintainers. Pertence a um `Project`. Tem muitos
  `Board` e muitos membros.
- **Board** — view/configuração Kanban, pertence a um `Team`. Não é dono
  direto dos items — é uma visão filtrada (ex: por Area Path no Azure
  DevOps). A relação Item↔Board é derivada, não uma FK fixa.
- **Item** — termo genérico para Epic/Feature/User Story/Task/Bug/Issue/Card,
  independente do provider. Pertence ao `Project`, não ao `Board`.
- **Pull Request** (Merge Request no GitLab) — representa um merge commit
  depois de passar por revisão. É entidade própria, separada de `Item`,
  porque rastreia marcos importantes na trajetória do desenvolvimento — não
  é só mais um tipo de item genérico. Pertence ao `Project`, no mesmo nível
  de `Item`. Quando mergeada, corresponde a um merge commit no histórico git
  local (`merge_commit_sha` faz essa ponte com o `Commit` já existente no
  GitBeholder).
  - Alguns Boards rastreiam Pull Requests junto com Items, outros não — isso
    é característica de exibição/configuração do Board, não uma relação de
    schema.
  - O vínculo Item↔Pull Request (equivalente ao "linked work items" nativo
    do Azure DevOps) fica só definido conceitualmente por agora — construímos
    a tabela de link e a UI apenas quando for necessário, seguindo o mesmo
    padrão da regra de auto-close (definida, mas inativa). Foco imediato é
    o caso Azure DevOps.
- **Commit** — conceito já existente no GitBeholder. O autor é identificado
  por nome/e-mail do git, o que exige uma resolução de identidade separada
  para mapear para um membro de `Team` no provider (não é 1:1 direto).

Mapeamento de hierarquia por provider (referência para quando o modelo
generalizar além do Azure DevOps):

| Termo genérico | Azure DevOps | Jira | Linear | GitHub | GitLab |
|---|---|---|---|---|---|
| Organization | Organization | Site | Workspace (nome deles) | Organization | Group (topo) |
| Project | Project | Project | Team | — (não existe) | Subgroup/Project |
| Team | Team (dentro do Project) | — (não é 1ª classe) | — (Team já é o "Project") | Team | — |
| Board | Board (por Team; view filtrada, não container) | Board (atado a 1 Project) | Cycle/view | Projects (beta) | Issue Board |

Pontos em aberto, a resolver antes de generalizar além do Azure DevOps:

1. **Board sem Team nativo** — Jira, GitHub e GitLab não têm "Team dono do
   Board" como o Azure DevOps. `Board.team_id` pode precisar ficar opcional,
   com um caminho alternativo (`Board` ligado direto ao `Project`) para
   provedores sem Team de primeira classe.
2. **Resolução de identidade** (autor do commit → usuário no provider →
   membro de Team) — ainda não modelada; é o próximo passo depois de fechar
   Item/Board/Team/Project/Organization.

Este modelo detalha, para efeitos de modelagem de dados, o que a seção
Arquitetura abaixo ainda trata como campos livres de `config` (Org URL +
Project). A reconciliação entre este modelo de domínio e as migrations da
seção Arquitetura é trabalho pendente, não decidido nesta proposta.

## Decisões travadas para v1

- **Autenticação**: Personal Access Token (PAT) apenas. Sem OAuth na v1 —
  evita registrar um app no Microsoft Entra ID e lidar com deep-link
  redirects do Tauri para a primeira integração.
- **Vínculo commit ↔ work item**: seletor visual explícito na UI de commit
  (não o atalho de convenção `AB#123` na mensagem). Melhor descoberta;
  usuário não precisa saber os IDs.
- **Gatilho de auto-close**: adiado até o GitBeholder ter uma feature de
  merge. A v1 entrega conexão + busca + vínculo, com a regra de auto-close
  visível porém inativa ("ativa quando o merge estiver disponível").

## Fundação cross-provider (aplica-se a todo provider futuro)

- Contrato interno: um behaviour `WorkItemProvider` em Elixir com
  `list_types/1`, `search_items/2`, `get_item/2`, `transition_item/3`,
  `link_commit/3`. Azure DevOps, GitHub Issues, Jira, Linear, etc. todos
  implementam essa mesma interface — é isso que permite plugar providers
  futuros sem reabrir a UI.
- Uma conexão de integração é escopada **por repositório**, não por
  workspace — cada repo pode apontar para uma org/project diferente.
- A regra de auto-close é **configurável por repositório**: provider
  habilitado + estado alvo (ex: "Closed" vs "Resolved" — times diferem) +
  evento gatilho. Persistimos essa regra agora, mesmo que fique inativa até
  o merge existir.
- Credenciais (PAT por enquanto) são armazenadas criptografadas e nunca
  enviadas de volta ao frontend após salvar — só um indicador "conectado" é
  exposto.

## Azure DevOps v1 — requisitos funcionais

- **Conectar**: Org URL + Project + PAT. Uma ação "Test connection" valida
  via `GET _apis/wit/workitemtypes` antes de salvar.
- **Tipos de work item por processo**: buscados dinamicamente (Epic/Feature/
  User Story/Task/Bug variam por template de processo — não podem ser fixos
  no código).
- **Busca/listagem**: via WIQL, com filtros básicos (atribuído a mim,
  estado, iteration/sprint) alimentando o seletor.
- **Vínculo commit ↔ work item**: salvar um vínculo grava localmente *e*
  chama a API de relations de work item do Azure DevOps (`ArtifactLink`),
  para que o commit também apareça no lado do Azure Boards — sem isso, o
  vínculo fica invisível para quem só usa o Azure DevOps.
- **Transição de estado** (construída agora, só disparada quando o merge
  existir): `PATCH` no work item para o estado configurado + adiciona um
  comentário referenciando o commit/branch.
- **Tratamento de erro explícito**: PAT inválido/expirado, work item não
  encontrado, transição de estado rejeitada pelas regras do processo (nem
  todo estado permite pulo direto para "Closed") — sempre exposto com
  mensagem acionável, nunca falha silenciosa.

## Arquitetura (segue o padrão existente módulo → controller → rota)

- `lib/git_beholder/integrations/` (context) +
  `lib/git_beholder/integrations/azure_devops.ex`
- Novas migrations:
  - tabela `integrations`: `repository_id`, `provider`, `config`, credenciais
    criptografadas, `enabled`
  - tabela `work_item_links`: `commit_sha`, `repository_id`, `provider`,
    `external_id`, `type`, `title` em cache, `url`
- Rotas em
  `/api/v1/workspaces/:workspace_id/repositories/:repository_id/integrations/azure-devops/...`
- Frontend: `app/src/features/integrations/` espelhando as pastas de feature
  já existentes (`api.ts`, `types.ts`, `hooks/`)

## Requisitos de UI

1. **Painel de integrações** — novo destino nas configurações do repositório
   (ainda não existe tela de configurações; esta seria a primeira). Lista os
   providers usando os ícones de marca já existentes (`PlatformIcon`), cada
   um mostrando estado conectado/desconectado.
2. **Diálogo "Connect Azure DevOps"** — segue o padrão dos diálogos
   existentes (`CloneRepositoryDialog`, etc.): campos Org URL / Project / PAT
   (mascarado), botão "Test connection", Save.
3. **Regra de auto-close** — dentro do mesmo painel: um toggle "Close work
   item on merge" + select de estado alvo. Visível porém com uma nota:
   "ativa quando o merge estiver disponível".
4. **Seletor de work item** — um combobox pesquisável reaproveitando `cmdk`,
   anexado ao painel de criação de commit (`ChangesColumn`/staging area),
   com um ícone por tipo (Epic/Feature/User Story/Task/Bug), ID e título.
5. **Badge de vínculo** — no log de commits (`CommitsColumn`) e no detalhe do
   commit, um chip pequeno tipo "AB#123 · User Story", clicável para abrir
   no navegador.
6. **Feedback de erro** — toasts para falha de conexão, token inválido,
   transição de estado rejeitada.

## Explicitamente fora de escopo para v1

OAuth, disparo automático (aguarda merge), outros providers (GitHub, GitLab,
Jira, Linear, Bitbucket), integrações de editor (VS Code, JetBrains), e as
integrações de LLM/agente de IA. Todos esses reaproveitam a fundação acima,
mas chegam depois que a integração com Azure DevOps validar o padrão.
