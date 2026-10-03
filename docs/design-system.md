# Design System

Fonte da verdade: os tokens em `app/src/App.css` (`@theme static` para o tema
escuro, `@media (prefers-color-scheme: light)` para o claro). Este documento
explica **quando usar cada token**; os valores vivem no CSS.

Princípios:

- **Denso, como uma IDE.** Base de 13px, linhas e controles de 28px. É um
  cliente Git usado o dia todo; cabe mais histórico na tela sem apertar.
- **Uma cor de marca, com função.** O azul `#2196F3` marca o que é
  interativo, selecionado ou em foco — não decora.
- **Acessível nos dois temas.** Todo par texto/fundo passa WCAG AA (4,5:1);
  os números estão nas tabelas abaixo.
- **Tokens, nunca valores soltos.** Nada de `text-[13px]`, `#hex` ou
  `h-[30px]` em componentes: se faltar um token, ele entra no `App.css` e
  neste documento.

## 1. Cor

### Escala da marca

Gerada em OKLCH a partir de `#2196F3` (brand-500), mesma matiz (249°),
luminosidade em degraus.

| Token | Hex | Contraste no fundo escuro (panel) | Contraste no branco |
|---|---|---|---|
| `brand-50` | `#eff6fe` | 16.85 | 1.09 |
| `brand-100` | `#daecff` | 15.22 | 1.21 |
| `brand-200` | `#b3d9ff` | 12.48 | 1.47 |
| `brand-300` | `#87c3ff` | 9.86 | 1.86 |
| `brand-400` | `#4daaff` | 7.43 | 2.47 |
| `brand-500` | `#2196f3` | **5.87** | 3.12 |
| `brand-600` | `#037bce` | 4.13 | 4.44 |
| `brand-700` | `#0166ad` | 3.06 | **5.99** |
| `brand-800` | `#034f88` | 2.16 | 8.48 |
| `brand-900` | `#023a65` | 1.57 | 11.69 |
| `brand-950` | `#002544` | 1.18 | 15.58 |

### Papéis do azul

`#2196F3` é claro: passa como texto no fundo escuro (5,9:1), mas tem só
3,1:1 no branco — e texto **branco sobre ele** também fica em 3,1:1, abaixo
do AA. Por isso:

| Token | Para quê | Escuro | Claro |
|---|---|---|---|
| `accent` | ícone, borda, trilho, barra da aba ativa, anel de foco | `brand-500` | `brand-500` |
| `accent-text` | **só texto** azul | `brand-500` (5,3–6,2:1) | `brand-700` (5,4–6,0:1) |
| `accent-fill` | preenchimento sólido (botão primário) | `brand-500` | `brand-500` |
| `on-accent` | texto sobre `accent-fill` | quase preto `#0a0f14` (6,2:1) | idem |
| `accent-fill-hover` | hover do preenchimento — **clareia** | `brand-400` (7,8:1 com `on-accent`) | idem |
| `accent-soft` | fundo de linha selecionada | 500 a 20% | 500 a 10% |

Botão primário = `#2196F3` com texto escuro. O hover clareia em vez de
escurecer: escurecer o fundo derrubaria o texto escuro para baixo do AA
(por isso o hover usa `hover:bg-accent-fill-hover`, não `bg-primary/80`).
Não use texto branco sobre `accent-fill`.

**Uma cor só.** Botões, ícones, barras e foco são o mesmo `#2196F3` nos dois
temas; a única variação é o texto azul no tema claro (`accent-text`), que
precisa de 4,5:1. No tema claro, `accent` como indicador fica em 3,1:1 no
`panel`, 2,97:1 no `canvas` e 2,8:1 no `surface` — um pouco abaixo dos 3:1
de não-texto (WCAG 1.4.11) em canvas/surface, aceito de propósito para a
marca ler como uma cor só. As versões transparentes (`accent-soft`,
`bg-accent/40`, `ring-ring/50`) são tintas intencionais.

### Neutros

Mesma matiz da marca com croma baixo, para cinza e azul parecerem da mesma
família.

| Token | Uso | Escuro | Claro |
|---|---|---|---|
| `canvas` | fundo do app, colunas principais | `#0a0f14` | `#f8f9fb` |
| `panel` | painéis laterais, header, popovers | `#10161b` | `#ffffff` |
| `surface` | controles elevados, inputs, badges | `#181f25` | `#eff3f6` |
| `surface-hover` | hover de `surface` | `#212930` | `#e3e8ed` |
| `line-subtle` | divisórias entre regiões | `#1e2329` | `#e6eaed` |
| `line-default` | borda de controles, trilhos | `#363e46` | `#cfd5db` |
| `ink` | texto principal | `#f0f4f7` — 16,5:1 | `#141d26` — 17,0:1 |
| `ink-secondary` | texto secundário | `#b0b8c1` — 9,1:1 | `#495561` — 7,6:1 |
| `ink-faint` | metadados, timestamps, placeholders | `#8a939d` — 5,9:1 | `#626d78` — 5,3:1 |

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
| `author-1` … `author-6` | cor estável por autor (avatar, chip) | teal, violeta, esmeralda, âmbar, rosa, ardósia — tons 400 | tons 800 (violeta 700, ardósia 600) |
| `tag` | ícone e chip de tag | `#fbbf24` | `#92400e` |

A cor de autor sai de um hash do nome (`authorColor` em `CommitsColumn`) —
nunca de um mapa de nomes. Cada tom passa AA como texto no `panel` e sobre a
própria tinta a 20% (`bg-author-n/20 text-author-n`): ≥5,2:1 no escuro,
≥4,8:1 no claro.

Nenhuma cor categórica é azul: um segundo azul ao lado da marca lê como
erro. Branch remota usa ícone de nuvem neutro (`ink-secondary`), não cor.

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
- [ ] Azul: ícone/borda/indicador → `accent`; texto → `accent-text`;
      fundo de botão → `accent-fill` (texto `on-accent`)
- [ ] Texto na escala (`text-row`, `text-caption`…), nada abaixo de 11px
- [ ] Altura de linha `h-row`, de controle `h-control`
- [ ] Raio e sombra da tabela acima
- [ ] Foco visível (`focus-visible:ring-ring/50` dos primitivos shadcn)
- [ ] Botão só com ícone tem `aria-label`
