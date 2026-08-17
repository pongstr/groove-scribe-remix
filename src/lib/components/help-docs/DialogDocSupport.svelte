<script lang="ts">
  import Articulations from '$lib/components/groove-editor/components/Articulations.svelte'
  import DialogAbout from '$lib/components/help-docs/DialogAbout.svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import {
    LANE_ARTICULATION_META,
    LANE_ARTICULATION_ORDER,
    LANE_META,
  } from '$lib/utils/config'
  import { getUIContext } from '$lib/utils/context'
  import type { LaneId } from '$lib/utils/types'

  const ui = getUIContext()

  const LEGEND_LANES: LaneId[] = ['hihat', 'snare', 'kick', 'tom1', 'sticking']

  function laneColor(lane: LaneId): string {
    const color = LANE_META[lane].color
    return color.startsWith('--') ? `var(${color})` : color
  }

  function onOpenChange(value: boolean) {
    if (!value) {
      ui.toggleHelp(value)
    }
  }
</script>

<DialogAbout />

<Dialog.Root open={$ui.helpOpen} {onOpenChange}>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-xl">
    <Dialog.Header>
      <Dialog.Title>How GrooveScribe Remix works</Dialog.Title>
      <Dialog.Description class="sr-only">
        Notation key and controls help
      </Dialog.Description>
    </Dialog.Header>

    <section class="mb-5">
      <h3
        class="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase"
      >
        Entering notes
      </h3>
      <ul class="text-foreground/90 list-disc space-y-1.5 pl-4 text-sm">
        <li>
          <strong>Tap / click</strong> a cell to toggle the lane's normal hit on or
          off.
        </li>
        <li>
          <strong>Long-press (touch) or right-click</strong> a cell to open the full
          articulation picker.
        </li>
        <li>
          <strong>Shift+click</strong> for a quick accent,
          <strong>Alt+click</strong> for a quick ghost/open (where available).
        </li>
        <li>
          The staff above the grid mirrors every column so you can see exactly
          what a cell plays.
        </li>
      </ul>
    </section>

    <section class="mb-5">
      <h3
        class="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase"
      >
        Playback
      </h3>
      <ul class="text-foreground/90 list-disc space-y-1.5 pl-4 text-sm">
        <li>
          <strong>Count-in</strong> plays one bar of beats matching the time signature
          (4/4 → 1–4) before the groove starts. Toggle it next to Play.
        </li>
        <li>
          <strong>Click</strong> adds a metronome under the groove: Off, Quarter,
          Eighth, or 16th (accented on beat 1 of each bar).
        </li>
        <li>Use <strong>Tap Tempo</strong> to set BPM by tapping along.</li>
      </ul>
    </section>

    <section class="mb-5">
      <h3
        class="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase"
      >
        Sheet music
      </h3>
      <ul class="text-foreground/90 list-disc space-y-1.5 pl-4 text-sm">
        <li>
          Notation is engraved with the same <strong>abc2svg</strong> engine GrooveScribe
          uses (real percussion staff, X-heads, accents, beams).
        </li>
        <li>
          Toggle <strong>Notation Key</strong> to show the full drum-notation system
          (Hi-Hat, Open, Close, Snare, Kick, etc.) above the staff — just like GrooveScribe's
          key/legend.
        </li>
      </ul>
    </section>

    <section>
      <h3
        class="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase"
      >
        Notation key
      </h3>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {#each LEGEND_LANES as lane (lane)}
          <div class="border-border rounded-xl border p-2.5">
            <div
              class="mb-1.5 text-xs font-extrabold"
              style:color={laneColor(lane)}
            >
              {LANE_META[lane].label}
            </div>
            <div class="flex flex-col gap-1">
              {#each LANE_ARTICULATION_ORDER[lane] as artId (artId)}
                {@const meta = LANE_ARTICULATION_META[lane][artId]}
                <div
                  class="text-muted-foreground flex items-center gap-1.5 text-xs"
                >
                  <Articulations
                    icon={meta.icon}
                    class="size-5 shrink-0"
                    style="color: {laneColor(lane)}"
                  />
                  <span>{meta.label}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </Dialog.Content>
</Dialog.Root>
