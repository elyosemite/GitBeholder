import { Separator } from "@/components/ui/separator"
import { HeaderRepositoryBlock } from "./HeaderRepositoryBlock"
import { HeaderBranchBlock } from "./HeaderBranchBlock"
import { HeaderGitOperationBlock } from "./HeaderGitOperationBlock"
import { HeaderSearchBlock } from "./HeaderSearchBlock"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center border-b border-border bg-background px-bar-x py-bar-y">
      <div className="flex flex-1 items-center gap-3">
        <HeaderRepositoryBlock />

        <Separator orientation="vertical" className="h-8 self-center" />

        <HeaderBranchBlock />
      </div>

      <HeaderGitOperationBlock />

      <div className="flex flex-1 justify-end">
        <HeaderSearchBlock />
      </div>
    </header>
  )
}

export default Header
