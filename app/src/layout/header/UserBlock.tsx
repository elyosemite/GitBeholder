import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser } from "@/features/users"
import { ProfileDialog, userInitials } from "./ProfileDialog"

// Header entry point to the local user's profile.
export function UserBlock() {
  const { data: user } = useCurrentUser()
  const [open, setOpen] = React.useState(false)

  if (!user) {
    return <Avatar size="sm" aria-hidden="true" />
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Profile: ${user.name}`}
        title={`${user.name} · ${user.email}`}
        className="flex size-control items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar size="sm">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="bg-accent-fill font-semibold text-on-accent">
            {userInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </button>
      <ProfileDialog user={user} open={open} onOpenChange={setOpen} />
    </>
  )
}
