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
import { BRANCHES as branches } from "@/mocks/git-data"

export function HeaderBranchBlock() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(branches[0].name)

  const selected = branches.find((branch) => branch.name === value)
  const SelectedIcon = selected?.origin ? Cloud : GitBranch

  return (
    <div className="w-52 shrink-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          aria-label="Branch"
          className="flex h-7 w-full items-center justify-between gap-icon rounded-md border border-input bg-transparent px-2 text-sm font-normal outline-none transition-colors select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span className="flex min-w-0 items-center gap-icon">
            <SelectedIcon
              aria-hidden="true"
              className={`size-4 shrink-0 ${selected?.origin ? "text-sky-500" : "text-muted-foreground"}`}
            />
            <span className="flex-none text-meta font-medium uppercase tracking-wide text-muted-foreground">
              Branch
            </span>
            <span className="truncate">{value}</span>
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
              <CommandEmpty>No branch found.</CommandEmpty>
              <CommandGroup>
                {branches.map((branch) => {
                  const Icon = branch.origin ? Cloud : GitBranch

                  return (
                    <CommandItem
                      key={branch.name}
                      value={branch.name}
                      data-checked={branch.name === value}
                      onSelect={(currentValue) => {
                        setValue(currentValue)
                        setOpen(false)
                      }}
                    >
                      <Icon
                        aria-hidden="true"
                        className={branch.origin ? "text-sky-500" : "text-muted-foreground"}
                      />
                      <span className="truncate">{branch.name}</span>
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
