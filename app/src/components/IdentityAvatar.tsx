import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authorColor, authorInitials } from "@/lib/authorColor"
import { cachedIdenticon, identiconFor } from "@/lib/identicon"
import { cn } from "@/lib/utils"

function useIdenticon(email: string) {
  const [url, setUrl] = React.useState(() => cachedIdenticon(email) ?? null)

  React.useEffect(() => {
    let cancelled = false
    setUrl(cachedIdenticon(email) ?? null)
    identiconFor(email).then((next) => {
      if (!cancelled) setUrl(next)
    })
    return () => {
      cancelled = true
    }
  }, [email])

  return url
}

/**
 * A person's avatar: their photo when known (GitBeholder user, later
 * integrations), otherwise the identicon of their email's hash. Colored
 * initials only show for the instant the hash is being computed.
 */
export function IdentityAvatar({
  name,
  email,
  photoUrl,
  size = "default",
  className,
  fallbackClassName,
}: {
  name: string
  email: string
  photoUrl?: string | null
  size?: "default" | "sm" | "lg" | "xs"
  className?: string
  fallbackClassName?: string
}) {
  const identicon = useIdenticon(email)
  const src = photoUrl || identicon

  return (
    // Opaque disc: the identicon and the initials tint are see-through.
    <Avatar size={size} className={cn("bg-canvas", className)}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback className={cn("font-semibold", authorColor(name), fallbackClassName)}>
        {authorInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
