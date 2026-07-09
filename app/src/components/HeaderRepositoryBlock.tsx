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

const repositories = [
  "GitBeholder",
  "api-gateway",
  "design-system",
  "mobile-app",
  "web-dashboard",
  "auth-service",
  "billing-service",
  "notification-service",
  "analytics-pipeline",
  "data-warehouse",
  "search-service",
  "recommendation-engine",
  "payments-core",
  "checkout-flow",
  "inventory-service",
  "shipping-service",
  "customer-support-portal",
  "admin-console",
  "marketing-site",
  "blog-cms",
  "docs-site",
  "developer-portal",
  "graphql-gateway",
  "rest-api-legacy",
  "websocket-server",
  "cron-jobs",
  "email-templates",
  "sms-gateway",
  "push-notifications",
  "feature-flags-service",
  "experimentation-platform",
  "observability-stack",
  "logging-pipeline",
  "metrics-collector",
  "tracing-service",
  "infra-terraform",
  "k8s-manifests",
  "ci-cd-pipelines",
  "design-tokens",
  "component-library",
  "storybook-addons",
  "testing-utils",
  "e2e-test-suite",
  "load-testing-tools",
  "security-scanner",
  "compliance-reports",
  "internal-cli",
  "sdk-javascript",
  "sdk-python",
  "sdk-go",
]

export function HeaderRepositoryBlock() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(repositories[0])

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
            <span className="truncate">{value}</span>
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
                {repositories.map((repo) => (
                  <CommandItem
                    key={repo}
                    value={repo}
                    data-checked={repo === value}
                    onSelect={(currentValue) => {
                      setValue(currentValue)
                      setOpen(false)
                    }}
                  >
                    <FolderGit2
                      aria-hidden="true"
                      className="text-muted-foreground"
                    />
                    <span className="truncate">{repo}</span>
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
