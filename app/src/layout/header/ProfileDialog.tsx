import * as React from "react"
import { ImageUp, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { IdentityAvatar } from "@/components/IdentityAvatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCurrentUser, type User } from "@/features/users"
import { resizeImageToDataUrl } from "@/lib/resizeImage"

export function ProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            How you appear in GitBeholder. Integrations will later bring your photo from each
            platform.
          </DialogDescription>
        </DialogHeader>

        {/* Remounted on every open so edits start from the saved profile. */}
        {open && <ProfileForm user={user} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ProfileForm({ user, onDone }: { user: User; onDone: () => void }) {
  const updateCurrentUser = useUpdateCurrentUser()
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatar_url)
  const [isSaving, setIsSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handlePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      setAvatarUrl(await resizeImageToDataUrl(file))
    } catch (err) {
      toast.error("Couldn't use that photo", { description: String(err) })
    }
  }

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await updateCurrentUser({ name: name.trim(), email: email.trim(), avatar_url: avatarUrl })
      toast.success("Profile saved")
      onDone()
    } catch (err) {
      toast.error("Couldn't save your profile", { description: String(err) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSave(event)} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {/* Live preview: follows the photo and the email being edited. */}
        <IdentityAvatar
          size="lg"
          name={name || user.name}
          email={email || user.email}
          photoUrl={avatarUrl}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImageUp />
            {avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {avatarUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl(null)}>
              <Trash2 />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handlePhotoSelected(event)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="text-caption text-ink-faint">
        Team <span className="font-medium text-ink-secondary">{user.team.name}</span>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isSaving || !name.trim() || !email.trim()}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  )
}
