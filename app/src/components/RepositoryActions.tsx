import * as React from "react"
import { Cloud, FolderGit2, FolderPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const ACTION_ITEM =
  "w-full justify-start gap-2 font-normal text-ink-secondary hover:text-ink"

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  )
}

// Dialogs are scaffolding only: no clone/init command is wired up yet.
export function RepositoryActions() {
  return (
    <div className="mb-3 flex flex-col gap-0.5">
      <Dialog>
        <DialogTrigger render={<Button variant="ghost" size="sm" className={ACTION_ITEM} />}>
          <FolderGit2 aria-hidden="true" size={15} />
          Clonar repositório local
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar repositório local</DialogTitle>
            <DialogDescription>
              Copia um repositório já existente no disco para um novo diretório.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Field id="clone-local-source" label="Repositório de origem" placeholder="/caminho/para/o/repositorio" />
            <Field id="clone-local-destination" label="Destino" placeholder="/caminho/para/o/destino" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <DialogClose render={<Button />}>Clonar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger render={<Button variant="ghost" size="sm" className={ACTION_ITEM} />}>
          <Cloud aria-hidden="true" size={15} />
          Clonar repositório remoto
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar repositório remoto</DialogTitle>
            <DialogDescription>
              Baixa um repositório a partir de uma URL remota (HTTPS ou SSH).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Field id="clone-remote-url" label="URL do repositório" placeholder="https://github.com/usuario/repo.git" />
            <Field id="clone-remote-destination" label="Destino" placeholder="/caminho/para/o/destino" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <DialogClose render={<Button />}>Clonar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger render={<Button variant="ghost" size="sm" className={ACTION_ITEM} />}>
          <FolderPlus aria-hidden="true" size={15} />
          Inicializar repositório
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inicializar repositório</DialogTitle>
            <DialogDescription>
              Cria um repositório Git novo em um diretório existente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Field id="init-directory" label="Diretório" placeholder="/caminho/para/o/diretorio" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <DialogClose render={<Button />}>Inicializar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RepositoryActions
