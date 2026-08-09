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

  function blurInput(e: KeyboardEvent) {
    if (e.currentTarget instanceof HTMLInputElement) {
      e.currentTarget.blur()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      blurInput(e)
    } else if (e.key === 'Escape') {
      draft = null
      blurInput(e)
    }
  }
</script>

<div
  class="border-secondary ml-2 flex items-center gap-0 bg-neutral-900/80 backdrop-blur-sm"
>
  <ButtonWithTooltip
    variant="outline"
    size="icon"
    class="text-muted-foreground hover:bg-background"
    disabled={$data.groove.tempo <= MIN_TEMPO}
    onclick={() => bump(-1)}
    aria-label="Decrease tempo"
    content="Decrease Tempo"
    tooltipContentProps={{ align: 'start' }}
  >
    <Minus class="size-5" />
  </ButtonWithTooltip>

  <div
    class="border-border flex h-10 flex-col items-stretch justify-start border-t border-b"
  >
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
      class="h-7 w-16 cursor-default appearance-none! rounded-md border-x-transparent px-1 text-center text-sm font-semibold focus-visible:border-none focus-visible:ring-0"
      aria-label="Tempo in BPM"
    />
    <span
      class="text-muted-foreground inline-block w-full px-4 text-left font-mono text-[9px] leading-0.5"
    >
      BPM
    </span>
  </div>

  <ButtonWithTooltip
    variant="outline"
    size="icon"
    class="text-muted-foreground hover:bg-background"
    disabled={$data.groove.tempo >= MAX_TEMPO}
    onclick={() => bump(1)}
    aria-label="Increase tempo"
    content="Increase Tempo"
    tooltipContentProps={{ align: 'end' }}
  >
    <Plus class="size-5" />
  </ButtonWithTooltip>
</div>
