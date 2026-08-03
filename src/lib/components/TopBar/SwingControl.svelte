<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { getDataContext } from '$lib/utils/context'
  import { isTripletDivision } from '$lib/utils/music-math'

  const data = getDataContext()

  const disabled = $derived(isTripletDivision($data.groove.division))
  const STEP = 5

  function clamp(value: number) {
    return Math.min(100, Math.max(0, value))
  }

  function bump(delta: number) {
    if (disabled) return
    data.setSwing(clamp($data.groove.swingPercent + delta))
  }
</script>

<div class="bg-muted flex items-center rounded-lg" class:opacity-40={disabled}>
  <Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground hover:bg-background rounded-md"
    disabled={disabled || $data.groove.swingPercent <= 0}
    onclick={() => bump(-STEP)}
    aria-label="Decrease swing"
  >
    <Minus class="size-4" />
  </Button>
  <span class="text-foreground w-10 text-center text-xs font-semibold">
    {$data.groove.swingPercent}%
  </span>

  <Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground hover:bg-background rounded-md"
    disabled={disabled || $data.groove.swingPercent >= 100}
    onclick={() => bump(STEP)}
    aria-label="Increase swing"
  >
    <Plus class="size-4" />
  </Button>
</div>
