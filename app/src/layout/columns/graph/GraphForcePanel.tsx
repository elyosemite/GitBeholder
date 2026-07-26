import { Slider } from "@/components/ui/slider"
import { MAX_GRAVITY_STRENGTH, MIN_GRAVITY_STRENGTH } from "@/lib/graph/useForceSimulation"

export function GraphForcePanel({
  gravityStrength,
  onGravityStrengthChange,
}: {
  gravityStrength: number
  onGravityStrengthChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line-subtle px-panel-x py-2">
      <span className="flex-none text-meta font-medium uppercase tracking-wide text-ink-faint">
        File pull
      </span>
      <Slider
        className="w-40"
        value={[gravityStrength]}
        min={MIN_GRAVITY_STRENGTH}
        max={MAX_GRAVITY_STRENGTH}
        step={0.005}
        onValueChange={(value) => onGravityStrengthChange(Array.isArray(value) ? value[0] : value)}
      />
      <span className="w-10 flex-none text-right font-mono text-meta text-ink-faint">
        {gravityStrength.toFixed(3)}
      </span>
    </div>
  )
}
