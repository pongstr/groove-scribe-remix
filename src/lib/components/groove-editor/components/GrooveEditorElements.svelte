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

  $effect(() => {
    const match = stickingModes.find((opt) => opt.value === $ui.stickingMode)
    if (match) stickingMode = match
  })

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
  <div class="flex flex-1 items-center gap-3">
    <ButtonGroup.Root class="bg-background/70">
      <ButtonWithTooltip
        size="icon"
        variant="outline"
        class="text-muted-foreground/70"
        content="Add Bar"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
        onclick={() => data.setMeasures($data.groove.measures + 1)}
      >
        <PanelRightClose class="size-5" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        size="icon"
        variant="outline"
        content="Remove Bar"
        class="text-muted-foreground/70"
        onclick={() => data.setMeasures($data.groove.measures - 1)}
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
      >
        <PanelRightOpen class="size-5" />
      </ButtonWithTooltip>
    </ButtonGroup.Root>

    <ButtonGroup.Root class="bg-background/70">
      <ToggleWithTooltip
        size="icon"
        pressed={$ui.showToms}
        onPressedChange={(pressed) => setShowToms(ui, data, pressed)}
        variant="outline"
        content="Toggle Toms [Q]"
        class="text-muted-foreground/70 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
      >
        <Drum class="size-5" />
      </ToggleWithTooltip>

      <ToggleWithTooltip
        variant="outline"
        size="icon"
        class="text-muted-foreground/70 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        pressed={$ui.showLegend}
        onPressedChange={(pressed) => setShowLegend(ui, data, pressed)}
        content="Toggle Notation Keys [E]"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
      >
        <Component class="size-5" />
      </ToggleWithTooltip>
    </ButtonGroup.Root>

    <RadioGroup.Root
      bind:value={stickingMode.value}
      onValueChange={handleValueChange}
    >
      <ButtonGroup.Root class="bg-background/70">
        {#each stickingModes as opt (opt)}
          {@render StickingRadioButton(opt)}
        {/each}
      </ButtonGroup.Root>
    </RadioGroup.Root>

    <ButtonGroup.Root class="bg-background/70 ml-auto">
      <ButtonWithTooltip
        variant="outline"
        size="icon"
        onclick={() => data.undo()}
        disabled={!$history.canUndo}
        content="Undo last action (U)"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
      >
        <Undo2 class="size-5" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        variant="outline"
        size="icon"
        onclick={() => data.redo()}
        disabled={!$history.canRedo}
        content="Redo last action (Y)"
      >
        <Redo2 class="size-5" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        size="icon"
        variant="outline"
        onclick={() => data.clearHistory()}
        disabled={!hasHistory}
        content="Clear Undo & Redo history"
        tooltipContentProps={{ align: 'end', sideOffset: 10 }}
      >
        <ListX class="size-5" />
      </ButtonWithTooltip>
    </ButtonGroup.Root>

    <div class="bg-border mx-0.5 h-full w-px">&nbsp;</div>

    <ButtonWithTooltip
      size="icon"
      variant="destructive"
      onclick={() => data.clearAll()}
      content="Clear All Lanes"
      tooltipContentProps={{ align: 'end', sideOffset: 10 }}
    >
      <BrushCleaning class="size-5" />
    </ButtonWithTooltip>
  </div>
</Tooltip.Provider>

{#snippet StickingRadioButton(opt: StickingModeType)}
  {@const id = ['sticking', opt.value].join('.')}
  <Tooltip.Root>
    <Tooltip.Trigger
      class={cn(
        buttonVariants({ variant: 'outline', size: 'icon' }),
        'text-muted-foreground/70 gap-2.5',
      )}
    >
      <Label for={id} class="font-sans">
        <RadioGroup.Item value={opt.value} {id} class="hidden rounded-[8px]" />
        {#if opt.value !== 'off'}
          <Hand
            class={cn(
              'size-5',
              opt.value === 'off' && 'text-muted-foreground/20',
              opt.value === 'reverse' && '-scale-x-100 transform',
              opt.value == $ui.stickingMode && 'text-green-600',
            )}
          />
        {:else}
          <span>Off</span>
        {/if}
      </Label>
    </Tooltip.Trigger>
    <Tooltip.Content
      sideOffset={10}
      align={opt.value === 'off'
        ? 'start'
        : opt.value === 'reverse'
          ? 'center'
          : 'end'}
    >
      {opt.label}
    </Tooltip.Content>
  </Tooltip.Root>
{/snippet}
