<script lang="ts">
  import {
    BrushCleaning,
    Component,
    Drum,
    Hand,
    ListX,
    PowerOff,
    Redo2,
    Undo2,
  } from '@lucide/svelte'

  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import ToggleWithTooltip from '$lib/components/ui/toggle/toggle-with-tooltip.svelte'
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import {
    setShowLegend,
    setShowToms,
    setStickingVisible,
  } from '$lib/utils/shortcuts'

  const stickingModes = [
    { label: 'Sticking Off', value: 'off', icon: '' },
    { label: 'Left Hand lead', value: 'reverse', icon: '' },
    { label: 'Right Hand lead', value: 'visible', icon: '' },
  ]

  let data = getDataContext()
  let ui = getUIContext()
  let history = data.history

  let stickingMode = $state(stickingModes[0])
  let hasHistory = $derived.by(() => $history.canUndo ?? $history.canRedo)

  function handleValueChange(value: string) {
    if (!value) return

    const match = stickingModes.find((opt) => opt.value === value)

    if (!match) return

    if (match.value === 'off') {
      stickingMode = stickingModes[0]

      ui.setStickingMode('off')
      setStickingVisible(ui, data, false)

      return
    }

    if (match.value !== 'off') {
      stickingMode = match
      ui.setStickingMode(value)
      setStickingVisible(ui, data, true)

      return
    }
  }
</script>

<Tooltip.Provider>
  <div class="flex flex-1 items-center gap-2">
    <ToggleGroup.Root
      type="single"
      variant="outline"
      size="sm"
      bind:value={stickingMode.value}
      onValueChange={handleValueChange}
      >{#each stickingModes as opt (opt)}
        <ToggleGroup.Item
          value={opt.value}
          class="group bg-background hover:text-foreground data-[state=on]:text-foreground size-9 rounded-md px-2"
        >
          <Tooltip.Root>
            <Tooltip.Trigger
              class="group-data-[state=off]:text-muted-foreground/60"
            >
              {#if opt.value === 'off'}
                <PowerOff class="size-5" />
              {/if}

              {#if opt.value !== 'off'}
                <Hand
                  class={cn(
                    'size-5',
                    opt.value === 'off' && 'text-muted-foreground/20',
                    opt.value === 'reverse' && '-scale-x-100 transform',
                  )}
                />
              {/if}
            </Tooltip.Trigger>
            <Tooltip.Content sideOffset={12}>{opt.label}</Tooltip.Content>
          </Tooltip.Root>
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>

    <ToggleWithTooltip
      class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-9"
      pressed={$ui.showToms}
      onPressedChange={(pressed) => setShowToms(ui, data, pressed)}
      variant="outline"
      size="default"
      content="Toggle Toms [Q]"
    >
      <Drum class="size-5" />
    </ToggleWithTooltip>

    <ToggleWithTooltip
      variant="outline"
      size="sm"
      class="bg-background aria-pressed:bg-primary aria-pressed:text-primary-foreground h-9 text-xs font-semibold"
      pressed={$ui.showLegend}
      onPressedChange={(pressed) => setShowLegend(ui, data, pressed)}
      content="Notation Keys [E]"
    >
      <Component class="size-5" />
    </ToggleWithTooltip>

    <ButtonWithTooltip
      variant="outline"
      size="sm"
      class="bg-background ml-auto h-9 text-xs font-semibold"
      onclick={() => data.undo()}
      disabled={!$history.canUndo}
      content="Undo (U)"
    >
      <Undo2 class="size-5" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      variant="outline"
      size="sm"
      class="bg-background h-9"
      onclick={() => data.redo()}
      disabled={!$history.canRedo}
      content="Redo (Y)"
    >
      <Redo2 class="size-5" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      variant="outline"
      size="sm"
      class="h-9 text-xs font-semibold"
      onclick={() => data.clearHistory()}
      disabled={!hasHistory}
      content="Clear Undo & Redo history"
      tooltipContentProps={{ align: 'end' }}
    >
      <ListX class="size-5" />
    </ButtonWithTooltip>

    <div class="bg-border mx-0.5 h-full w-px">&nbsp;</div>

    <ButtonWithTooltip
      variant="destructive"
      size="sm"
      class="h-9 text-xs font-semibold"
      onclick={() => data.clearAll()}
      content="Clear All Lanes"
      tooltipContentProps={{ align: 'end' }}
    >
      <BrushCleaning class="size-5" />
    </ButtonWithTooltip>
  </div>
</Tooltip.Provider>
