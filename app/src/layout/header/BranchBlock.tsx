import * as React from "react"
import { ChevronsUpDown, Cloud, GitBranch, Loader2 } from "lucide-react"

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
import { useBranches, useCheckoutBranch, type Branch } from "@/features/branches"

export function BranchBlock() {
  const [open, setOpen] = React.useState(false)
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { repository, branch } = useSession()
  const { data: branches, error: loadError } = useBranches()
  const checkoutBranch = useCheckoutBranch()

  const selected = (branches ?? []).find((b) => b.name === branch)
  const SelectedIcon = selected?.local ? GitBranch : Cloud

  const handleSelect = async (b: Branch) => {
    setIsCheckingOut(true)
    setError(null)
    try {
      await checkoutBranch(b.name)
      setOpen(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="w-52 shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          aria-label="Branch"
          disabled={!repository || isCheckingOut}
          className="flex h-7 w-full items-center justify-between gap-icon rounded-md border border-input bg-transparent px-2 text-sm font-normal outline-none transition-colors select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span className="flex min-w-0 items-center gap-icon">
            {isCheckingOut ? (
              <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <SelectedIcon
                aria-hidden="true"
                className={`size-4 shrink-0 ${!selected?.local ? "text-sky-500" : "text-muted-foreground"}`}
              />
            )}
            <span className="flex-none text-meta font-medium uppercase tracking-wide text-muted-foreground">
              Branch
            </span>
            <span className="truncate">{branch ?? "Select…"}</span>
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
                {loadError ? "Failed to load branches." : "No branches found."}
              </CommandEmpty>
              <CommandGroup>
                {(branches ?? []).map((b) => {
                  const Icon = b.local ? GitBranch : Cloud

                  return (
                    <CommandItem
                      key={b.name}
                      value={b.name}
                      data-checked={b.name === branch}
                      disabled={isCheckingOut}
                      onSelect={() => void handleSelect(b)}
                    >
                      <Icon
                        aria-hidden="true"
                        className={b.local ? "text-muted-foreground" : "text-sky-500"}
                      />
                      <span className="truncate">{b.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          {error && <p className="border-t border-border px-3 py-2 text-caption text-danger">{error}</p>}
        </PopoverContent>
      </Popover>
    </div>
  )
}
