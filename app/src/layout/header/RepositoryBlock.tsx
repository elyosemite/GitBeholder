import * as React from "react"
import { ChevronsUpDown, FolderGit2 } from "lucide-react"

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
import { REPOSITORIES } from "@/mocks/git-data"

export function RepositoryBlock() {
  const [open, setOpen] = React.useState(false)
  const { repository, selectRepository } = useSession()

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
        <PopoverContent align="start" className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search repository…" />
            <CommandList>
              <CommandEmpty>No repository found.</CommandEmpty>
              <CommandGroup>
                {REPOSITORIES.map((repo) => (
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
    </div>
  )
}
