import * as React from "react"
import {
  ChevronsUpDown,
  DownloadCloud,
  FolderGit2,
  FolderOpen,
  FolderPlus,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSession } from "@/features/session"
import { useRepositories } from "@/features/repositories"
import { OpenLocalRepositoryDialog } from "./OpenLocalRepositoryDialog"
import { CloneRepositoryDialog } from "./CloneRepositoryDialog"
import { InitRepositoryDialog } from "./InitRepositoryDialog"

type RepositoryDialog = "open" | "clone" | "init" | null

const actionItemClassName =
  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground outline-hidden transition-colors select-none hover:bg-muted focus-visible:bg-muted [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

function RepositoryActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" className={actionItemClassName} onClick={onClick}>
      <Icon aria-hidden="true" />
      {label}
    </button>
  )
}

export function RepositoryBlock() {
  const [open, setOpen] = React.useState(false)
  const [activeDialog, setActiveDialog] = React.useState<RepositoryDialog>(null)
  const { repository, selectRepository } = useSession()
  const { data: repositories, error } = useRepositories()

  function openDialog(dialog: RepositoryDialog) {
    setOpen(false)
    setActiveDialog(dialog)
  }

  return (
    <div className="w-52 shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          aria-label="Repository"
          className="flex h-7 w-full items-center justify-between gap-icon rounded-md border border-input bg-transparent px-2 text-sm font-normal outline-none transition-colors select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span className="flex min-w-0 items-center gap-icon">
            <FolderGit2
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="flex-none text-meta font-medium uppercase tracking-wide text-muted-foreground">
              Repo
            </span>
            <span className="truncate">{repository?.name ?? "Selecionar…"}</span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground opacity-50"
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search repository…" />

            <div className="flex flex-col gap-0.5 p-1">
              <RepositoryActionButton
                icon={FolderOpen}
                label="Abrir repositório local…"
                onClick={() => openDialog("open")}
              />
              <RepositoryActionButton
                icon={DownloadCloud}
                label="Clonar repositório remoto…"
                onClick={() => openDialog("clone")}
              />
              <RepositoryActionButton
                icon={FolderPlus}
                label="Inicializar novo repositório…"
                onClick={() => openDialog("init")}
              />
            </div>

            <div className="-mx-1 h-px bg-border" />

            <CommandList>
              <CommandEmpty>
                {error ? "Erro ao carregar repositórios." : "Nenhum repositório encontrado."}
              </CommandEmpty>
              <CommandGroup heading="Repositórios">
                {(repositories ?? []).map((repo) => (
                  <CommandItem
                    key={repo.id}
                    value={repo.name}
                    data-checked={repo.id === repository?.id}
                    onSelect={() => {
                      selectRepository(repo)
                      setOpen(false)
                    }}
                  >
                    <FolderGit2
                      aria-hidden="true"
                      className="text-muted-foreground"
                    />
                    <span className="truncate">{repo.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <OpenLocalRepositoryDialog
        open={activeDialog === "open"}
        onOpenChange={(next) => setActiveDialog(next ? "open" : null)}
      />
      <CloneRepositoryDialog
        open={activeDialog === "clone"}
        onOpenChange={(next) => setActiveDialog(next ? "clone" : null)}
      />
      <InitRepositoryDialog
        open={activeDialog === "init"}
        onOpenChange={(next) => setActiveDialog(next ? "init" : null)}
      />
    </div>
  )
}
