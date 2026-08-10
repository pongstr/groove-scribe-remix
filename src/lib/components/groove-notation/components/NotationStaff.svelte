<script lang="ts">
  // GrooveScribe-faithful notation: GrooveData → ABC → abc2svg engraved SVG.
  // Sized to the visible parent width; systems wrap onto new lines (vertical growth).
  import { browser } from '$app/environment'
  import {
    gridSlotToAbcNoteIndex,
    renderGrooveToSvg,
  } from '$lib/utils/abc/render-abc'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { calcNotesPerMeasure } from '$lib/utils/music-math'
  import { withDisplayStickings } from '$lib/utils/sticking-display'
  import type { GrooveData } from '$lib/utils/types'

  interface Props {
    /** When set, render this groove instead of the live editor groove. */
    groove?: GrooveData
    /** Show playhead highlight (only meaningful for the active practice item). */
    active?: boolean
    /** When false, suppress the print header name/author block. */
    showHeader?: boolean
  }

  let { groove, active = true, showHeader = true }: Props = $props()

  const data = getDataContext()
  const ui = getUIContext()
  const playhead = data.playhead

  let containerWidth = $state(960)
  let hostEl: HTMLDivElement | undefined = $state()

  const source = $derived(groove ?? $data.groove)

  const rendered = $derived.by(() => {
    if (!browser)
      return { svg: '', errorHtml: '', noteMapping: [] as boolean[] }

    const reverse = $ui.stickingMode === 'reverse'
    const displaySource = withDisplayStickings(source, reverse)
    // Display toggles live on UI prefs — queue snapshots keep their own copies.
    const showToms = $ui.showToms
    const showStickings = $ui.stickingMode !== 'off'
    const showLegend = $ui.showLegend

    // Destructure (with defaults) so $derived tracks every field that affects engraving.
    const {
      hiHat = [],
      snare = [],
      kick = [],
      toms = [[], [], [], []] as GrooveData['toms'],
      sticking = [],
      division = 16,
      measures = 1,
      timeSignature = { beats: 4, noteValue: 4 as const },
      kickStemsUp = true,
      author = '',
      comments = '',
    } = displaySource

    const grooveData: GrooveData = {
      ...displaySource,
      hiHat,
      snare,
      kick,
      toms,
      sticking,
      division,
      measures,
      timeSignature,
      showToms,
      showStickings,
      showLegend,
      kickStemsUp,
      name: '',
      author,
      comments,
    }

    const width = Math.max(640, Math.floor(containerWidth - 32))
    try {
      return renderGrooveToSvg(grooveData, width)
    } catch (err) {
      console.error('abc2svg render failed', err)
      return {
        svg: `<p class="abc-error">Could not render notation.</p>`,
        errorHtml: err instanceof Error ? err.message : String(err),
        noteMapping: [] as boolean[],
      }
    }
  })

  const highlightIndex = $derived.by(() => {
    if (!active || $playhead.currentSlot < 0) return -1
    const { division, measures, timeSignature } = source
    return gridSlotToAbcNoteIndex(
      $playhead.currentSlot,
      rendered.noteMapping,
      calcNotesPerMeasure(division, timeSignature),
      measures,
      timeSignature.beats,
      timeSignature.noteValue,
      division,
    )
  })

  $effect(() => {
    if (!hostEl) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w && Math.abs(w - containerWidth) > 4) containerWidth = w
    })
    ro.observe(hostEl)
    containerWidth = hostEl.clientWidth || containerWidth
    return () => ro.disconnect()
  })

  $effect(() => {
    if (!hostEl) return
    const idx = highlightIndex
    for (const el of hostEl.querySelectorAll('.abcr.highlighted')) {
      el.classList.remove('highlighted')
    }
    if (idx < 0) return
    for (const el of hostEl.querySelectorAll(`#abcNoteNum_1_${idx}`)) {
      el.classList.add('highlighted')
    }
  })
</script>

<div class="notation-staff text-card-foreground" bind:this={hostEl}>
  <div>
    {#if showHeader}
      <div class="print-header text-foreground">
        {#if source.name}
          <strong>{source.name}</strong>
        {/if}
        {#if source.author}
          <span> — {source.author}</span>
        {/if}
      </div>
    {/if}

    <div
      id={active ? 'notation-staff-svg' : undefined}
      class="abc-host text-foreground box-border min-h-55 w-full max-w-full overflow-x-hidden"
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html rendered.svg}
    </div>

    {#if rendered.errorHtml}
      <div class="abc-warnings px-3 pt-1 pb-3 text-xs text-amber-600">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html rendered.errorHtml}
      </div>
    {/if}
  </div>
</div>

<style>
  .abc-host :global(svg) {
    width: 100% !important;
    max-width: 100%;
    height: auto !important;
    display: block;
    margin-inline: auto;
    color: var(--muted-foreground);
  }
  .abc-host :global(text),
  .abc-host :global(tspan) {
    fill: currentColor !important;
  }

  .abc-host :global(.abcr.highlighted) {
    fill: color-mix(in oklch, var(--primary) 35%, transparent) !important;
  }

  /* Staff lines & beams: softer than noteheads. */
  .abc-host :global(path.stroke) {
    stroke-opacity: 0.3;
  }

  /* Custom drum heads (X/Triangle) keep full weight. */
  .abc-host :global(path.stroke[style*='stroke-width']) {
    stroke-opacity: 1;
  }

  :global(.abc-error) {
    padding: 1rem;
    color: var(--destructive);
  }
</style>
