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

export function CloneRepositoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [url, setUrl] = React.useState("")
  const [destination, setDestination] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clonar repositório remoto</DialogTitle>
          <DialogDescription>
            Informe a URL do repositório remoto e onde a cópia local deve ser criada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clone-url">URL do repositório</Label>
          <Input
            id="clone-url"
            placeholder="https://github.com/usuario/repositorio.git"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clone-destination">Pasta de destino</Label>
          <InputGroup>
            <InputGroupInput
              id="clone-destination"
              placeholder="C:\Users\você\projetos"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
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
          <Button
            type="button"
            disabled={!url.trim() || !destination.trim()}
            onClick={() => onOpenChange(false)}
          >
            Clonar repositório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
