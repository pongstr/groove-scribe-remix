<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { getDataContext } from '$lib/utils/context'
  import { isTripletDivision } from '$lib/utils/music-math'

  const STEP = 5

  let data = getDataContext()
  let disabled = $derived(isTripletDivision($data.groove.division))

  function clamp(value: number) {
    return Math.min(100, Math.max(0, value))
  }

  function bump(delta: number) {
    if (disabled) return
    data.setSwing(clamp($data.groove.swingPercent + delta))
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex items-center justify-between gap-2">
    <span class="text-sm font-semibold">Swing</span>
  </div>

  <div
    class="bg-background/50 flex h-9 items-center justify-between border p-0.5"
    class:opacity-40={disabled}
  >
    <Button
      variant="ghost"
      class="text-muted-foreground hover:bg-background rounded-md"
      disabled={disabled || $data.groove.swingPercent <= 0}
      onclick={() => bump(-STEP)}
      aria-label="Decrease swing"
    >
      <Minus class="size-5" />
    </Button>

    <span class="text-foreground w-10 text-center text-lg font-semibold">
      {$data.groove.swingPercent}%
    </span>

    <Button
      variant="ghost"
      class="text-muted-foreground hover:bg-background rounded-md"
      disabled={disabled || $data.groove.swingPercent >= 100}
      onclick={() => bump(STEP)}
      aria-label="Increase swing"
    >
      <Plus class="size-5" />
    </Button>
  </div>
</div>
