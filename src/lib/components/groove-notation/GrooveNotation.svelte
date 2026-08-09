<script lang="ts">
  import { quadOut, quintOut } from 'svelte/easing'
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
    'h-full w-full overflow-y-auto pt-[10vh]',
    !$ui.practiceMode.active && $ui.editorVisible && 'pb-135',
  )}
>
  {#if $ui.practiceMode.active}
    <div
      in:fly={{ duration: 250, y: -150, easing: quintOut }}
      out:fly={{ duration: 250, y: -50, easing: quintOut }}
      class="mx-auto h-full w-full max-w-6xl pt-[10vh] select-none"
    >
      <NotationQueue />
    </div>
  {/if}

  {#if !$ui.practiceMode.active}
    <div
      class="bg-background/50 border-border/40 flex w-auto flex-col rounded-lg border py-24 lg:mx-4 xl:mx-auto xl:w-full xl:max-w-6xl"
      in:fly={{ duration: 250, y: 150, delay: 140, easing: quadOut }}
      out:fade={{ duration: 250, easing: quadOut }}
    >
      <div
        class="text-muted-foreground/90 mx-auto w-auto max-w-5xl font-sans text-lg"
      >
        {#if $data.groove.name.length}
          <span>{$data.groove.name}</span>
        {/if}
        {tempoMarking.symbol} = {$data.groove.tempo}
      </div>

      <div class="groove-notation">
        <NotationStaff />
      </div>
    </div>
  {/if}
</div>
