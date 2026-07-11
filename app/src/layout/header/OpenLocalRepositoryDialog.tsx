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
import { Label } from "@/components/ui/label"

export function OpenLocalRepositoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [path, setPath] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir repositório local</DialogTitle>
          <DialogDescription>
            Selecione a pasta de um repositório Git já existente na sua máquina.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="open-local-path">Caminho da pasta</Label>
          <InputGroup>
            <InputGroupInput
              id="open-local-path"
              placeholder="C:\Users\você\projetos\meu-repo"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              autoFocus
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                // TODO: wire to Tauri's dialog plugin (folder picker) once available.
                onClick={() => {}}
              >
                <FolderOpen />
                Procurar…
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <DialogFooter showCloseButton>
          <Button type="button" disabled={!path.trim()} onClick={() => onOpenChange(false)}>
            Abrir repositório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
