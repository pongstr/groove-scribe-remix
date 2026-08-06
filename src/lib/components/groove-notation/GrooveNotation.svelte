<script lang="ts">
  import { quadIn, quadOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'

  import NotationQueue from '$lib/components/groove-notation/components/NotationQueue.svelte'
  import NotationStaff from '$lib/components/groove-notation/components/NotationStaff.svelte'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { tempoMarkingForTimeSignature } from '$lib/utils/music-math'

  let data = getDataContext()
  let ui = getUIContext()

  let tempoMarking = $derived(
    tempoMarkingForTimeSignature($data.groove.timeSignature),
  )
</script>

<div
  class={cn(
    'groove-notation h-screen flex-1 shrink overflow-x-hidden transition-[height,min-height,flex-grow] duration-300 ease-out',
    !$ui.practiceMode.active && 'overflow-y-auto pt-[8vh] select-none',
  )}
>
  {#if $ui.practiceMode.active}
    <div
      in:fly={{ duration: 250, delay: 200, y: -150, easing: quadIn }}
      out:fly={{ duration: 250, y: -50, easing: quadOut }}
      class="mx-auto h-full w-full max-w-6xl pt-[10vh] select-none"
    >
      <NotationQueue />
    </div>
  {/if}

  {#if !$ui.practiceMode.active}
    <div
      class="mx-auto flex w-full max-w-7xl flex-col pt-10 pb-22"
      in:fly={{ duration: 250, y: 150, delay: 140, easing: quadOut }}
      out:fade={{ duration: 250, easing: quadOut }}
    >
      <div class="text-muted-foreground/90 mx-auto w-6xl font-sans text-lg">
        {#if $data.groove.name.length}
          <span>{$data.groove.name}</span>
        {/if}
        {tempoMarking.symbol} = {$data.groove.tempo}
      </div>

      <NotationStaff />
    </div>
  {/if}
</div>
