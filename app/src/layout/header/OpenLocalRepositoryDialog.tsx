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
import { Label } from "@/components/ui/label"
import { useOpenLocalRepository } from "@/features/repositories"

export function OpenLocalRepositoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [path, setPath] = React.useState("")
  const [isOpening, setIsOpening] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const openLocalRepository = useOpenLocalRepository()

  React.useEffect(() => {
    if (open) {
      setPath("")
      setError(null)
    }
  }, [open])

  const handleOpen = async () => {
    setIsOpening(true)
    setError(null)
    try {
      await openLocalRepository(path.trim())
      onOpenChange(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsOpening(false)
    }
  }

  const handleBrowse = async () => {
    const selected = await openFolderDialog({
      directory: true,
      multiple: false,
      title: "Select repository",
    })
    if (typeof selected === "string") setPath(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open local repository</DialogTitle>
          <DialogDescription>
            Select the folder of an existing Git repository on your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="open-local-path">Folder path</Label>
          <InputGroup>
            <InputGroupInput
              id="open-local-path"
              placeholder="C:\Users\you\projects\my-repo"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={isOpening}
              autoFocus
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                disabled={isOpening}
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
            disabled={!path.trim() || isOpening}
            onClick={() => void handleOpen()}
          >
            {isOpening ? "Opening…" : "Open repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
