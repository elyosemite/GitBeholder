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
    <div className="flex items-center gap-1">
      {operations.map(({ label, icon: Icon }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="gap-icon font-normal text-muted-foreground hover:text-foreground"
        >
          <Icon aria-hidden="true" size={16} />
          {label}
        </Button>
      ))}
    </div>
  )
}
