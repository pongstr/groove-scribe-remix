<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { MAX_TEMPO, MIN_TEMPO } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  let data = getDataContext()

  function clamp(value: number) {
    return value
    // return Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, value));
  }

  function bump(delta: number) {
    data.setTempo(clamp($data.groove.tempo + delta))
  }

  function handleInput(e: Event) {
    const value = Number((e.target as HTMLInputElement).value)
    if (Number.isNaN(value)) return
    data.setTempo(clamp(value))
  }
</script>

<div class="border-secondary flex h-9 items-center gap-0">
  <Button
    variant="outline"
    size="icon-sm"
    class="text-muted-foreground hover:bg-background size-9"
    disabled={$data.groove.tempo <= MIN_TEMPO}
    onclick={() => bump(-1)}
    aria-label="Decrease tempo"
  >
    <Minus class="size-5" />
  </Button>

  <Input
    type="number"
    min={MIN_TEMPO}
    max={MAX_TEMPO}
    step={1}
    bind:value={$data.groove.tempo}
    oninput={handleInput}
    class="border-border bg-background h-9 w-16 rounded-md border-x-transparent px-1 text-center text-sm font-semibold"
    aria-label="Tempo in BPM"
  />

  <Button
    variant="outline"
    size="icon-sm"
    class="text-muted-foreground hover:bg-background size-9"
    disabled={$data.groove.tempo >= MAX_TEMPO}
    onclick={() => bump(1)}
    aria-label="Increase tempo"
  >
    <Plus class="size-5" />
  </Button>
</div>
