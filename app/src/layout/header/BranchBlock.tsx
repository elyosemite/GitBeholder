import * as React from "react"
import { ChevronsUpDown, Cloud, GitBranch } from "lucide-react"

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
import { useBranches } from "@/features/branches"

export function BranchBlock() {
  const [open, setOpen] = React.useState(false)
  const { repository, branch, setBranch } = useSession()
  const { data: branches, error } = useBranches()

  const selected = (branches ?? []).find((b) => b.name === branch)
  const SelectedIcon = selected?.origin ? Cloud : GitBranch

  return (
    <div className="w-52 shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          aria-label="Branch"
          disabled={!repository}
          className="flex h-7 w-full items-center justify-between gap-icon rounded-md border border-input bg-transparent px-2 text-sm font-normal outline-none transition-colors select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span className="flex min-w-0 items-center gap-icon">
            <SelectedIcon
              aria-hidden="true"
              className={`size-4 shrink-0 ${selected?.origin ? "text-sky-500" : "text-muted-foreground"}`}
            />
            <span className="flex-none text-meta font-medium uppercase tracking-wide text-muted-foreground">
              Branch
            </span>
            <span className="truncate">{branch ?? "Selecionar…"}</span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground opacity-50"
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search branch…" />
            <CommandList>
              <CommandEmpty>
                {error ? "Erro ao carregar branches." : "Nenhuma branch encontrada."}
              </CommandEmpty>
              <CommandGroup>
                {(branches ?? []).map((b) => {
                  const Icon = b.origin ? Cloud : GitBranch

                  return (
                    <CommandItem
                      key={b.name}
                      value={b.name}
                      data-checked={b.name === branch}
                      onSelect={() => {
                        setBranch(b.name)
                        setOpen(false)
                      }}
                    >
                      <Icon
                        aria-hidden="true"
                        className={b.origin ? "text-sky-500" : "text-muted-foreground"}
                      />
                      <span className="truncate">{b.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
