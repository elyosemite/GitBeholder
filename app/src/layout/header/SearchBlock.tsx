import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function SearchBlock() {
  return (
    <InputGroup className="w-64">
      <InputGroupAddon>
        <Search aria-hidden="true" size={16} />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Paste your commit hash here…"
        aria-label="Search by commit hash"
        name="commit-hash"
        autoComplete="off"
      />
    </InputGroup>
  )
}
