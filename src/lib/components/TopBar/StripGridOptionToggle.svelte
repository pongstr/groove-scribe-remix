<script lang="ts">
  import { cubicOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'

  import { Button } from '$lib/components/ui/button'
  import { Toggle } from '$lib/components/ui/toggle'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import {
    setShowLegend,
    setShowToms,
    setStickingVisible,
  } from '$lib/utils/shortcuts'

  const data = getDataContext()
  const ui = getUIContext()
  const history = data.history

  const stickingsOn = $derived($ui.stickingMode !== 'off')
  const hasHistory = $derived($history.canUndo || $history.canRedo)
</script>

<div class="flex flex-col items-stretch gap-2">
  <span class="text-muted-foreground text-xs font-bold tracking-wide uppercase">
    &nbsp;
  </span>

  <div class="flex items-center gap-2">
    <Toggle
      variant="outline"
      size="sm"
      class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-8 text-xs font-semibold"
      pressed={$ui.showToms}
      onPressedChange={(pressed) => setShowToms(ui, data, pressed)}
    >
      Toms
    </Toggle>

    <Toggle
      variant="outline"
      size="sm"
      class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-8 text-xs font-semibold"
      pressed={stickingsOn}
      onPressedChange={(pressed) => setStickingVisible(ui, data, pressed)}
      title={$ui.stickingMode === 'reverse'
        ? 'Stickings (reverse display)'
        : 'R/L Stickings'}
    >
      {$ui.stickingMode === 'reverse' ? 'R/L ↔' : 'R/L Stickings'}
    </Toggle>

    {#if stickingsOn}
      <div
        class="overflow-hidden"
        transition:slide={{ duration: 220, easing: cubicOut, axis: 'x' }}
      >
        <Button
          variant="secondary"
          size="sm"
          class="h-8 text-xs font-semibold"
          onclick={() => data.reverseStickings()}
          title="Permanently swap R and L in the groove data"
        >
          Reverse R/L
        </Button>
      </div>
    {/if}

    <Toggle
      variant="outline"
      size="sm"
      class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-8 text-xs font-semibold"
      pressed={$ui.showLegend}
      onPressedChange={(pressed) => setShowLegend(ui, data, pressed)}
      title="Show the full drum notation key above the staff (like GrooveScribe)"
    >
      Notation Key
    </Toggle>

    <Button
      variant="secondary"
      size="sm"
      class="h-8 text-xs font-semibold"
      onclick={() => ui.togglePermutations()}
    >
      Practice Mode
    </Button>

    <Button
      variant="destructive"
      size="sm"
      class="h-8 text-xs font-semibold"
      onclick={() => data.clearAll()}
    >
      Clear All
    </Button>

    <Button
      variant="outline"
      size="sm"
      class="h-8 text-xs font-semibold"
      onclick={() => data.undo()}
      disabled={!$history.canUndo}
      title="Undo (U)"
    >
      Undo
    </Button>

    <Button
      variant="outline"
      size="sm"
      class="h-8 text-xs font-semibold"
      onclick={() => data.redo()}
      disabled={!$history.canRedo}
      title="Redo (Y)"
    >
      Redo
    </Button>

    <Button
      variant="outline"
      size="sm"
      class="h-8 text-xs font-semibold"
      onclick={() => data.clearHistory()}
      disabled={!hasHistory}
      title="Clear undo / redo history"
    >
      Clear History
    </Button>
  </div>
</div>
