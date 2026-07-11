import * as React from "react"
import {
  GitPullRequest,
  Upload,
  GitBranch,
  Package,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePush, usePushStatus } from "@/features/push"
import { useSession } from "@/features/session"
import { useStashes } from "@/features/stashes"

export function GitOperationBlock() {
  const { data: pushStatus } = usePushStatus()
  const push = usePush()
  const [isPushing, setIsPushing] = React.useState(false)

  const { data: stashes, loading: isLoadingStashes } = useStashes()
  const { invalidate } = useSession()

  const ahead = pushStatus?.ahead ?? 0
  const stashCount = stashes?.length ?? 0

  const handlePush = async () => {
    setIsPushing(true)
    try {
      await push()
    } finally {
      setIsPushing(false)
    }
  }

  const operations = [
    { label: "Pull", icon: GitPullRequest },
    {
      label: "Push",
      icon: Upload,
      badge: ahead > 0 ? ahead : undefined,
      onClick: handlePush,
      disabled: isPushing || ahead === 0,
      loading: isPushing,
    },
    { label: "Branch", icon: GitBranch },
    {
      label: "Stash",
      icon: Package,
      badge: stashCount > 0 ? stashCount : undefined,
      onClick: () => invalidate("stashes"),
      disabled: isLoadingStashes,
      loading: isLoadingStashes,
    },
  ]

  return (
    <div className="flex items-center gap-1">
      {operations.map(({ label, icon: Icon, badge, onClick, disabled, loading }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="gap-icon font-normal text-muted-foreground hover:text-foreground"
        >
          <Icon aria-hidden="true" size={16} />
          {label}
          {loading ? (
            <Loader2 aria-hidden="true" size={12} className="-ml-1 animate-spin text-accent" />
          ) : (
            badge !== undefined && (
              <Badge
                variant="outline"
                className="-ml-1 h-4 px-1.5 font-mono text-micro font-normal text-accent"
              >
                {badge}
              </Badge>
            )
          )}
        </Button>
      ))}
    </div>
  )
}
