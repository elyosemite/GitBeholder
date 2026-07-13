import * as React from "react"
import { FolderOpen } from "lucide-react"
import { open as openFolderDialog } from "@tauri-apps/plugin-dialog"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCloneRepository } from "@/features/repositories"

export function CloneRepositoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [url, setUrl] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const [isCloning, setIsCloning] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const cloneRepository = useCloneRepository()

  React.useEffect(() => {
    if (open) {
      setUrl("")
      setDestination("")
      setError(null)
    }
  }, [open])

  const handleClone = async () => {
    setIsCloning(true)
    setError(null)
    try {
      await cloneRepository(url.trim(), destination.trim())
      onOpenChange(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsCloning(false)
    }
  }

  const handleBrowse = async () => {
    const selected = await openFolderDialog({
      directory: true,
      multiple: false,
      title: "Select destination folder",
    })
    if (typeof selected === "string") setDestination(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone remote repository</DialogTitle>
          <DialogDescription>
            Enter the remote repository URL and where the local copy should be created.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clone-url">Repository URL</Label>
          <Input
            id="clone-url"
            placeholder="https://github.com/user/repository.git"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isCloning}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clone-destination">Destination folder</Label>
          <InputGroup>
            <InputGroupInput
              id="clone-destination"
              placeholder="C:\Users\you\projects"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isCloning}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                disabled={isCloning}
                onClick={() => void handleBrowse()}
              >
                <FolderOpen />
                Browse…
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {error && <p className="text-caption text-danger">{error}</p>}
        </div>

        <DialogFooter showCloseButton>
          <Button
            type="button"
            disabled={!url.trim() || !destination.trim() || isCloning}
            onClick={() => void handleClone()}
          >
            {isCloning ? "Cloning…" : "Clone repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
