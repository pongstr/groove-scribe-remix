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

<div class="h-full max-h-full w-full overflow-y-auto pt-[10vh]">
  {#if $ui.practiceMode.active}
    <div
      class="flex w-auto flex-col rounded-lg py-24 lg:mx-4 xl:mx-auto xl:w-full xl:max-w-6xl"
      in:fly={{
        y: 100,
        opacity: 1,
        delay: 100,
        duration: 450,
        easing: quadOut,
      }}
      out:fly={{
        y: -100,
        delay: 50,
        opacity: 0,
        duration: 450,
        easing: quadOut,
      }}
    >
      <NotationQueue />
    </div>
  {/if}

  {#if !$ui.practiceMode.active}
    <div
      class={cn(
        'bg-background/50 border-border/40  h-auto w-auto rounded-lg border py-24 lg:mx-4 xl:mx-auto xl:w-full xl:max-w-6xl',
        $ui.editorVisible && !$ui.showToms && 'pb-96',
        $ui.editorVisible && $ui.showToms && 'pb-155',
      )}
      in:fly={{
        y: 100,
        opacity: 1,
        delay: 100,
        duration: 450,
        easing: quadOut,
      }}
      out:fly={{
        y: -100,
        delay: 50,
        opacity: 0,
        duration: 450,
        easing: quadOut,
      }}
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
