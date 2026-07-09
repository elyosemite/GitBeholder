import { Separator } from "@/components/ui/separator"
import { RepositoryBlock } from "./RepositoryBlock"
import { BranchBlock } from "./BranchBlock"
import { GitOperationBlock } from "./GitOperationBlock"
import { SearchBlock } from "./SearchBlock"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center border-b border-border bg-background px-bar-x py-bar-y">
      <div className="flex flex-1 items-center gap-3">
        <RepositoryBlock />

        <Separator orientation="vertical" className="h-8 self-center" />

        <BranchBlock />
      </div>

      <GitOperationBlock />

      <div className="flex flex-1 justify-end">
        <SearchBlock />
      </div>
    </header>
  )
}

export default Header
