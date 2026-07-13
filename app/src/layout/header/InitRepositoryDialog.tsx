import * as React from "react"
import { FolderOpen } from "lucide-react"

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

export function InitRepositoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState("")
  const [location, setLocation] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initialize new repository</DialogTitle>
          <DialogDescription>
            Create a Git repository from scratch in a new local folder.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="init-name">Repository name</Label>
          <Input
            id="init-name"
            placeholder="my-new-repository"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="init-location">Location</Label>
          <InputGroup>
            <InputGroupInput
              id="init-location"
              placeholder="C:\Users\you\projects"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                // TODO: wire to Tauri's dialog plugin (folder picker) once available.
                onClick={() => {}}
              >
                <FolderOpen />
                Browse…
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <DialogFooter showCloseButton>
          <Button
            type="button"
            disabled={!name.trim() || !location.trim()}
            onClick={() => onOpenChange(false)}
          >
            Create repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
