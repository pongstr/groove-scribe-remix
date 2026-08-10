<script lang="ts">
  import { quadOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

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
    'w-full py-[10vh]',
    $ui.editorVisible && !$ui.showToms && !$ui.practiceMode.active && 'pb-75',
    $ui.editorVisible && $ui.showToms && !$ui.practiceMode.active && 'pb-155',
  )}
>
  <div
    class={cn(
      'bg-background/50 border-border/40  w-auto rounded-lg border py-14 lg:mx-4 xl:mx-auto xl:w-full xl:max-w-6xl',
    )}
  >
    {#if !$ui.practiceMode.active}
      <div
        in:fly={{ y: 0, easing: quadOut }}
        out:fly={{ y: -20, easing: quadOut }}
        class={cn(
          'text-muted-foreground/90 mx-auto w-auto max-w-5xl font-sans text-lg',
        )}
      >
        {#if $data.groove.name.length}
          <span>{$data.groove.name}</span>
        {/if}
        {tempoMarking.symbol} = {$data.groove.tempo}
      </div>

      <div class="groove-notation mx-10">
        <NotationStaff />
      </div>
    {/if}

    {#if $ui.practiceMode.active}
      <div
        in:fly={{ y: 0, easing: quadOut }}
        out:fly={{ y: -20, easing: quadOut }}
        class={cn('text-muted-foreground/90  w-auto font-sans text-lg')}
      >
        <div class="groove-notation">
          <NotationQueue />
        </div>
      </div>
    {/if}
  </div>
</div>
