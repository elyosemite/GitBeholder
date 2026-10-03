# Design System

Fonte da verdade: os tokens em `app/src/App.css` (`@theme static` para o tema
escuro, `@media (prefers-color-scheme: light)` para o claro). Este documento
explica **quando usar cada token**; os valores vivem no CSS.

Princípios:

- **Denso, como uma IDE.** Base de 13px, linhas e controles de 28px. É um
  cliente Git usado o dia todo; cabe mais histórico na tela sem apertar.
- **Uma cor de marca, com função.** O azul `#4949EB` marca o que é
  interativo, selecionado ou em foco — não decora.
- **Acessível nos dois temas.** Todo par texto/fundo passa WCAG AA (4,5:1);
  os números estão nas tabelas abaixo.
- **Tokens, nunca valores soltos.** Nada de `text-[13px]`, `#hex` ou
  `h-[30px]` em componentes: se faltar um token, ele entra no `App.css` e
  neste documento.

## 1. Cor

### Escala da marca

Gerada em OKLCH a partir de `#4949EB` (brand-600), mesma matiz (274°),
luminosidade em degraus.

| Token | Hex | Contraste no fundo escuro (panel) | Contraste no branco |
|---|---|---|---|
| `brand-50` | `#f2f5fe` | 16.85 | 1.09 |
| `brand-100` | `#e3e9fe` | 15.17 | 1.21 |
| `brand-200` | `#c7d2fe` | 12.31 | 1.49 |
| `brand-300` | `#a2b2fe` | 9.04 | 2.03 |
| `brand-400` | `#7a8cff` | **6.14** | 2.99 |
| `brand-500` | `#5e69ff` | 4.32 | 4.25 |
| `brand-600` | `#4949eb` | 3.00 | **6.11** |
| `brand-700` | `#3527c4` | 1.96 | 9.38 |
| `brand-800` | `#2809a6` | 1.47 | 12.50 |
| `brand-900` | `#1b017c` | 1.17 | 15.65 |
| `brand-950` | `#0f0053` | 1.00 | 18.34 |

### Papéis do azul

`#4949EB` tem só 3,0:1 sobre o fundo escuro — reprova como texto. Por isso
o azul tem três papéis, cada um com o tom que passa no contraste:

| Token | Para quê | Escuro | Claro |
|---|---|---|---|
| `accent` | texto, ícone, borda, trilho de seleção, anel de foco | `brand-400` (6,1:1) | `brand-600` (6,1:1) |
| `accent-fill` | preenchimento sólido com texto branco (botão primário) | `brand-600` | `brand-600` |
| `accent-fill-hover` | hover/pressionado do preenchimento | `brand-700` | `brand-700` |
| `accent-soft` | fundo de linha selecionada | 600 a 20% | 600 a 10% |
| `on-accent` | texto sobre `accent-fill` | branco (6,1:1) | branco (6,1:1) |

O `primary` do shadcn aponta para `accent-fill`, então `<Button>` padrão já
sai com `#4949EB` e texto branco. Não use `brand-500` como fundo de texto
branco: 4,25:1, abaixo do AA.

### Neutros

Mesma matiz da marca com croma baixo, para cinza e azul parecerem da mesma
família.

| Token | Uso | Escuro | Claro |
|---|---|---|---|
| `canvas` | fundo do app, colunas principais | `#0c0e14` | `#f8f9fb` |
| `panel` | painéis laterais, header, popovers | `#13141c` | `#ffffff` |
| `surface` | controles elevados, inputs, badges | `#1c1e26` | `#f1f2f7` |
| `surface-hover` | hover de `surface` | `#252731` | `#e5e7ed` |
| `line-subtle` | divisórias entre regiões | `#21222a` | `#e8e9ee` |
| `line-default` | borda de controles, trilhos | `#3a3d47` | `#d2d4db` |
| `ink` | texto principal | `#f2f3f8` — 16,6:1 | `#181b26` — 17,2:1 |
| `ink-secondary` | texto secundário | `#b4b7c2` — 9,2:1 | `#4f5362` — 7,7:1 |
| `ink-faint` | metadados, timestamps, placeholders | `#8f929e` — 5,9:1 | `#686b79` — 5,3:1 |

(Contrastes medidos contra `panel`; contra `canvas` e `surface` todos ficam
acima de 4,5:1 também.)

### Status e sobreposições

| Token | Escuro | Claro |
|---|---|---|
| `success` | `#4ade80` | `#15803d` |
| `warning` | `#fbbf24` | `#b45309` |
| `danger` | `#f87171` | `#dc2626` |
| `overlay-hover` / `overlay-press` | branco 4% / 7% | ink 4% / 7% |
| `scrim` (fundo de modal) | 60% | 40% |

Cor de status nunca vem sozinha: acompanhe de ícone ou texto.

### Categóricas

| Token | Uso | Escuro | Claro |
|---|---|---|---|
| `author-1` … `author-6` | cor estável por autor (avatar, chip) | tons 400 | tons 800 |
| `tag` | ícone e chip de tag | `#fbbf24` | `#92400e` |
| `remote` | branch remota | `#38bdf8` | `#075985` |

A cor de autor sai de um hash do nome (`authorColor` em `CommitsColumn`) —
nunca de um mapa de nomes. Cada tom passa AA como texto no `panel` e sobre a
própria tinta a 20% (`bg-author-n/20 text-author-n`): ≥5,2:1 no escuro,
≥4,8:1 no claro.

## 2. Tipografia

- **Inter** (variável) para toda a interface.
- **JetBrains Mono** (variável) para hashes, caminhos, diffs, timestamps e
  números que precisam alinhar — `font-mono` já liga `tabular-nums`.
- Inter com `cv05`, `cv08` e `ss01`: `l`/`I`/`1` distinguíveis e dígitos
  abertos, que leem melhor ao lado de hashes.

### Escala

Piso de **11px** — nada no app é menor.

| Classe | Tamanho / linha | Peso | Uso |
|---|---|---|---|
| `text-micro` | 11 / 16 | 500 | badges, iniciais de avatar, contadores |
| `text-meta` | 11 / 16, +0,04em | 500–700, caixa alta | rótulos de seção, timestamps |
| `text-caption` | 12 / 16 | 400 | informação secundária, caminhos, estados vazios |
| `text-row` | 13 / 20 | 400 (500 no item atual) | linhas de lista |
| `text-body` | 13 / 20 | 400 | texto padrão da interface |
| `text-title` | 14 / 20 | 600 | títulos de painel e de diálogo |
| `text-heading` | 16 / 24 | 600 | títulos de seção, estado vazio |
| `text-display` | 20 / 28 | 600 | título de página |
| `text-display-lg` | 24 / 32, −0,01em | 700 | onboarding, números de destaque |

Rótulos de seção em caixa alta: `text-meta font-bold uppercase
tracking-caps` (`--tracking-caps` = 0,08em).

As classes padrão do Tailwind foram remapeadas para a mesma escala
(`text-xs` = 12, `text-sm` = 13, `text-base` = 14, `text-lg` = 16,
`text-xl` = 20, `text-2xl` = 24), então os componentes shadcn seguem o
sistema sem edição.

### Pesos

| Peso | Classe | Uso |
|---|---|---|
| 400 | `font-normal` | corpo, linhas |
| 500 | `font-medium` | botões, rótulos, nomes em listas |
| 600 | `font-semibold` | títulos, item atual/selecionado |
| 700 | `font-bold` | só `display-lg` e rótulos `meta` em caixa alta |

## 3. Espaçamento e tamanhos

Grade de 4px. Use a escala do Tailwind (`1` = 4px) e os tokens nomeados:

| Token | Valor | Uso |
|---|---|---|
| `bar-x` / `bar-y` | 12 / 6 | padding de barras (header, toolbars) |
| `row-x` | 12 | padding horizontal de linhas |
| `panel-x` / `panel-y` | 16 / 12 | padding de seções de painel |
| `icon` | 8 | espaço entre ícone e texto (`gap-icon`) |
| `row` | 28 | altura de linha de lista (`h-row`) |
| `row-gap` | 4 | espaço entre linhas de lista |
| `control` | 28 | botões, inputs, selects (`h-control`) |
| `control-sm` | 24 | botões dentro de linhas |
| `control-lg` | 32 | ação principal de diálogo |

### Ícones

Sempre Lucide (ou `PlatformIcon` para marcas), dimensionados por token —
nunca `size={14}`:

| Classe | Valor | Uso |
|---|---|---|
| `size-icon-xs` | 12 | dentro de chips e badges |
| `size-icon-sm` | 14 | linhas de lista |
| `size-icon-md` | 16 | botões, header |

`PlatformIcon` recebe `size="xs" | "sm" | "md"`.

### Tokens no JavaScript

Quando a conta de layout precisa acontecer em JS (lista virtualizada,
posição de alça de redimensionar), leia o token com `pxToken("--spacing-row")`
(`src/lib/designTokens.ts`) — não repita o número como constante.

## 4. Raio

| Token | Valor | Uso |
|---|---|---|
| `rounded-xs` | 2px | chips de ref dentro de linhas |
| `rounded-sm` | 4px | controles pequenos, checkbox |
| `rounded-md` | 6px | botões, inputs, seleção de lista |
| `rounded-lg` | 8px | popovers, menus, cards |
| `rounded-xl` | 12px | diálogos |
| `rounded-4xl` | pílula | badges de contagem |

## 5. Elevação

| Token | Uso |
|---|---|
| `shadow-xs` | controles destacados do fundo |
| `shadow-sm` | cards, tooltips |
| `shadow-md` | popovers, dropdowns, command |
| `shadow-lg` | diálogos |
| `shadow-xl` | sobreposições de tela cheia |

No escuro, sombra sozinha quase não aparece: os tokens escuros somam um
realce interno de 1px no topo. No claro as sombras são suaves e puxadas
para o `ink`, não preto puro.

## 6. Movimento

- Duração padrão **150ms** (`transition` já usa); entradas até 240ms.
- `ease-out` para entrar, `ease-in` para sair, `ease-in-out` para mover.
- Só `transform` e `opacity` — nunca largura/altura.
- `prefers-reduced-motion` desliga animações e transições globalmente
  (`App.css`); estados continuam mudando, só sem movimento.

## 7. Checklist para componente novo

- [ ] Cores só por token (`bg-panel`, `text-ink-faint`, `border-line-subtle`…) —
      nunca cores da paleta do Tailwind (`sky-500`, `amber-400`…) nem `#hex`
- [ ] Ícones com `size-icon-*`, nunca `size={n}`
- [ ] Números de layout em JS via `pxToken`, nunca constantes duplicadas
- [ ] Azul como texto/ícone → `accent`; como fundo com texto → `accent-fill`
- [ ] Texto na escala (`text-row`, `text-caption`…), nada abaixo de 11px
- [ ] Altura de linha `h-row`, de controle `h-control`
- [ ] Raio e sombra da tabela acima
- [ ] Foco visível (`focus-visible:ring-ring/50` dos primitivos shadcn)
- [ ] Botão só com ícone tem `aria-label`
