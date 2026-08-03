<script lang="ts">
  import type { Component } from 'svelte'
  import type { SVGAttributes } from 'svelte/elements'

  import NoteheadBuzz from '$lib/components/groove-editor/components/articulation-icons/NoteheadBuzz.svelte'
  import NoteheadCircle from '$lib/components/groove-editor/components/articulation-icons/NoteheadCircle.svelte'
  import NoteheadCircleGhost from '$lib/components/groove-editor/components/articulation-icons/NoteheadCircleGhost.svelte'
  import NoteheadCircleOpen from '$lib/components/groove-editor/components/articulation-icons/NoteheadCircleOpen.svelte'
  import NoteheadCircleX from '$lib/components/groove-editor/components/articulation-icons/NoteheadCircleX.svelte'
  import NoteheadCross from '$lib/components/groove-editor/components/articulation-icons/NoteheadCross.svelte'
  import NoteheadDiamond from '$lib/components/groove-editor/components/articulation-icons/NoteheadDiamond.svelte'
  import NoteheadDrag from '$lib/components/groove-editor/components/articulation-icons/NoteheadDrag.svelte'
  import NoteheadFlam from '$lib/components/groove-editor/components/articulation-icons/NoteheadFlam.svelte'
  import NoteheadPlus from '$lib/components/groove-editor/components/articulation-icons/NoteheadPlus.svelte'
  import NoteheadTriangle from '$lib/components/groove-editor/components/articulation-icons/NoteheadTriangle.svelte'
  import NoteheadX from '$lib/components/groove-editor/components/articulation-icons/NoteheadX.svelte'
  import StickingBoth from '$lib/components/groove-editor/components/articulation-icons/StickingBoth.svelte'
  import StickingCount from '$lib/components/groove-editor/components/articulation-icons/StickingCount.svelte'
  import StickingL from '$lib/components/groove-editor/components/articulation-icons/StickingL.svelte'
  import StickingR from '$lib/components/groove-editor/components/articulation-icons/StickingR.svelte'
  import type { ArticulationIconId } from '$lib/components/groove-editor/components/articulation-icons/types'

  type Props = SVGAttributes<SVGSVGElement> & {
    icon: ArticulationIconId
  }

  let { icon, class: className, ...rest }: Props = $props()

  const ICONS: Record<
    ArticulationIconId,
    Component<SVGAttributes<SVGSVGElement>>
  > = {
    'notehead-x': NoteheadX,
    'notehead-circle-open': NoteheadCircleOpen,
    'notehead-plus': NoteheadPlus,
    'notehead-diamond': NoteheadDiamond,
    'notehead-triangle': NoteheadTriangle,
    'notehead-circle': NoteheadCircle,
    'notehead-circle-ghost': NoteheadCircleGhost,
    'notehead-cross': NoteheadCross,
    'notehead-buzz': NoteheadBuzz,
    'notehead-flam': NoteheadFlam,
    'notehead-drag': NoteheadDrag,
    'notehead-circle-x': NoteheadCircleX,
    'sticking-r': StickingR,
    'sticking-l': StickingL,
    'sticking-both': StickingBoth,
    'sticking-count': StickingCount,
  }

  const Icon = $derived(ICONS[icon])
</script>

<Icon class={className} {...rest} />
