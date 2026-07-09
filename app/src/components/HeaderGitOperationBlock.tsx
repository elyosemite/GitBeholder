import {
  GitPullRequest,
  Upload,
  GitBranch,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const operations = [
  {
    label: "Pull",
    icon: GitPullRequest,
  },
  {
    label: "Push",
    icon: Upload,
  },
  {
    label: "Branch",
    icon: GitBranch,
  },
  {
    label: "Stash",
    icon: Package,
  },
]

export function HeaderGitOperationBlock() {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
      {operations.map(({ label, icon: Icon }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="gap-1.5 font-normal text-muted-foreground hover:text-foreground"
        >
          <Icon aria-hidden="true" size={16} />
          {label}
        </Button>
      ))}
    </div>
  )
}
