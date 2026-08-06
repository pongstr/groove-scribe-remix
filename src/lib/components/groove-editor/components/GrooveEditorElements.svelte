<script lang="ts">
  import {
    BrushCleaning,
    Component,
    Drum,
    Hand,
    ListX,
    PanelRightClose,
    PanelRightOpen,
    Redo2,
    Undo2,
  } from '@lucide/svelte'

  import { buttonVariants } from '$lib/components/ui/button'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import Label from '$lib/components/ui/label/label.svelte'
  import * as RadioGroup from '$lib/components/ui/radio-group/index'
  import ToggleWithTooltip from '$lib/components/ui/toggle/toggle-with-tooltip.svelte'
  import * as Tooltip from '$lib/components/ui/tooltip/index'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import {
    setShowLegend,
    setShowToms,
    setStickingVisible,
  } from '$lib/utils/shortcuts'

  type StickingModeType = Record<'label' | 'value', string>

  const stickingModes: Array<StickingModeType> = [
    { label: 'Sticking Off', value: 'off' },
    { label: 'Left Hand lead', value: 'reverse' },
    { label: 'Right Hand lead', value: 'visible' },
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
    <ButtonGroup.Root class="bg-background">
      <ButtonWithTooltip
        variant="outline"
        size="icon"
        content="Add Bar"
        tooltipContentProps={{ align: 'start' }}
        onclick={() => data.setMeasures($data.groove.measures + 1)}
      >
        <PanelRightClose class="size-5" />
      </ButtonWithTooltip>
      <ButtonWithTooltip
        variant="outline"
        size="icon"
        content="Remove Bar"
        onclick={() => data.setMeasures($data.groove.measures - 1)}
        tooltipContentProps={{ align: 'start' }}
      >
        <PanelRightOpen class="size-5" />
      </ButtonWithTooltip>
    </ButtonGroup.Root>

    <ButtonGroup.Root class="bg-background">
      <ToggleWithTooltip
        class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-9"
        pressed={$ui.showToms}
        onPressedChange={(pressed) => setShowToms(ui, data, pressed)}
        variant="outline"
        size="default"
        content="Toggle Toms [Q]"
        tooltipContentProps={{ align: 'start' }}
      >
        <Drum class="size-5" />
      </ToggleWithTooltip>

      <ToggleWithTooltip
        variant="outline"
        size="sm"
        class="aria-pressed:bg-primary aria-pressed:text-primary-foreground h-9 text-xs font-semibold"
        pressed={$ui.showLegend}
        onPressedChange={(pressed) => setShowLegend(ui, data, pressed)}
        content="Notation Keys [E]"
        tooltipContentProps={{ align: 'start' }}
      >
        <Component class="size-5" />
      </ToggleWithTooltip>
    </ButtonGroup.Root>

    <RadioGroup.Root
      bind:value={stickingMode.value}
      onValueChange={handleValueChange}
      class="flex items-center justify-start"
    >
      <ButtonGroup.Root class="bg-background">
        {#each stickingModes as opt (opt)}
          {@render StickingRadioButton(opt)}
        {/each}
      </ButtonGroup.Root>
    </RadioGroup.Root>

    <ButtonGroup.Root class="bg-background ml-auto">
      <ButtonWithTooltip
        variant="outline"
        class="bg-background h-9 text-xs font-semibold"
        onclick={() => data.undo()}
        disabled={!$history.canUndo}
        content="Undo last action (U)"
      >
        <Undo2 class="size-5" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        variant="outline"
        class="bg-background h-9"
        onclick={() => data.redo()}
        disabled={!$history.canRedo}
        content="Redo last action (Y)"
      >
        <Redo2 class="size-5" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        variant="outline"
        class="h-9 text-xs font-semibold"
        onclick={() => data.clearHistory()}
        disabled={!hasHistory}
        content="Clear Undo & Redo history"
        tooltipContentProps={{ align: 'end' }}
      >
        <ListX class="size-5" />
      </ButtonWithTooltip>
    </ButtonGroup.Root>

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

{#snippet StickingRadioButton(opt: StickingModeType)}
  {@const id = ['sticking', opt.value].join('.')}
  <Tooltip.Root>
    <Tooltip.Trigger
      class={cn(buttonVariants({ variant: 'outline' }), 'h-9 gap-2.5')}
    >
      <RadioGroup.Item value={opt.value} {id} class="rounded-[8px]" />
      {#if opt.value !== 'off'}
        <Hand
          class={cn(
            'size-5',
            opt.value === 'off' && 'text-muted-foreground/20',
            opt.value === 'reverse' && '-scale-x-100 transform',
          )}
        />
      {:else}
        <Label for={id} class="font-sans text-xs">{opt.label}</Label>
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content align={opt.value === 'reverse' ? 'end' : 'start'}>
      {opt.label}
    </Tooltip.Content>
  </Tooltip.Root>
{/snippet}
