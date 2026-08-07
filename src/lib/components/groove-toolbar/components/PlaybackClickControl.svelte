<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import { Input } from '$lib/components/ui/input'
  import { MAX_TEMPO, MIN_TEMPO } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  let data = getDataContext()

  /** Local draft while editing; null shows the committed groove tempo. */
  let draft = $state<string | null>(null)

  function clamp(value: number) {
    return Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, value))
  }

  function bump(delta: number) {
    draft = null
    data.setTempo(clamp($data.groove.tempo + delta))
  }

  function handleFocus() {
    draft ??= String($data.groove.tempo)
  }

  function handleInput(e: Event) {
    draft = (e.target as HTMLInputElement).value
  }

  function commitTempo() {
    const raw = draft ?? String($data.groove.tempo)
    draft = null
    const parsed = Number.parseInt(raw, 10)
    if (Number.isNaN(parsed)) return
    data.setTempo(clamp(parsed))
  }

  function handleBlur() {
    commitTempo()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.currentTarget instanceof HTMLInputElement && e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      draft = null
      e.currentTarget instanceof HTMLInputElement && e.currentTarget.blur()
    }
  }
</script>

<div class="border-secondary flex h-9 items-center gap-0">
  <ButtonWithTooltip
    variant="outline"
    size="icon-sm"
    class="text-muted-foreground hover:bg-background size-9"
    disabled={$data.groove.tempo <= MIN_TEMPO}
    onclick={() => bump(-1)}
    aria-label="Decrease tempo"
    content="Decrease Tempo"
    tooltipContentProps={{ align: 'start' }}
  >
    <Minus class="size-5" />
  </ButtonWithTooltip>

  <Input
    type="number"
    min={MIN_TEMPO}
    max={MAX_TEMPO}
    step={1}
    value={draft ?? String($data.groove.tempo)}
    onfocus={handleFocus}
    oninput={handleInput}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    class="border-border bg-background h-9 w-16 rounded-md border-x-transparent px-1 text-center text-sm font-semibold"
    aria-label="Tempo in BPM"
  />

  <ButtonWithTooltip
    variant="outline"
    size="icon-sm"
    class="text-muted-foreground hover:bg-background size-9"
    disabled={$data.groove.tempo >= MAX_TEMPO}
    onclick={() => bump(1)}
    aria-label="Increase tempo"
    content="Increase Tempo"
    tooltipContentProps={{ align: 'end' }}
  >
    <Plus class="size-5" />
  </ButtonWithTooltip>
</div>
