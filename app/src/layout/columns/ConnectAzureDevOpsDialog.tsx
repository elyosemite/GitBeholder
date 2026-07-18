import * as React from "react"

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
import { useConnectAzureDevOps, useTestAzureDevOpsConnection } from "@/features/integrations"

export function ConnectAzureDevOpsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [orgUrl, setOrgUrl] = React.useState("")
  const [project, setProject] = React.useState("")
  const [pat, setPat] = React.useState("")
  const [isTesting, setIsTesting] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [testPassed, setTestPassed] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const testConnection = useTestAzureDevOpsConnection()
  const connect = useConnectAzureDevOps()

  React.useEffect(() => {
    if (open) {
      setOrgUrl("")
      setProject("")
      setPat("")
      setTestPassed(false)
      setError(null)
    }
  }, [open])

  // Editing any field after a successful test invalidates it — the
  // credentials/config being saved must be the ones that were tested.
  function updateField(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setTestPassed(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setError(null)
    try {
      await testConnection({ config: { org_url: orgUrl.trim(), project: project.trim() }, credentials: pat })
      setTestPassed(true)
    } catch (err) {
      setTestPassed(false)
      setError(String(err))
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await connect({ config: { org_url: orgUrl.trim(), project: project.trim() }, credentials: pat })
      onOpenChange(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const fieldsFilled = Boolean(orgUrl.trim() && project.trim() && pat)
  const isBusy = isTesting || isSaving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Azure DevOps</DialogTitle>
          <DialogDescription>
            Enter your organization URL, project, and a personal access token, then test the
            connection before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="azdo-org-url">Organization URL</Label>
          <Input
            id="azdo-org-url"
            placeholder="https://dev.azure.com/your-org"
            value={orgUrl}
            onChange={(e) => updateField(setOrgUrl)(e.target.value)}
            disabled={isBusy}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="azdo-project">Project</Label>
          <Input
            id="azdo-project"
            placeholder="YourProject"
            value={project}
            onChange={(e) => updateField(setProject)(e.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="azdo-pat">Personal access token</Label>
          <Input
            id="azdo-pat"
            type="password"
            placeholder="Personal access token"
            value={pat}
            onChange={(e) => updateField(setPat)(e.target.value)}
            disabled={isBusy}
          />
          {error && <p className="text-caption text-danger">{error}</p>}
        </div>

        <DialogFooter showCloseButton>
          <Button
            type="button"
            variant="outline"
            disabled={!fieldsFilled || isBusy}
            onClick={() => void handleTest()}
          >
            {isTesting ? "Testing…" : "Test connection"}
          </Button>
          <Button
            type="button"
            disabled={!testPassed || isBusy}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
