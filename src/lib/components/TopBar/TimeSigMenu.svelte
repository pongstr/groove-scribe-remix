<script lang="ts">
  import { get } from 'svelte/store'

  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import * as Popover from '$lib/components/ui/popover'
  import { cn } from '$lib/utils'
  import { getDataContext } from '$lib/utils/context'

  const data = getDataContext()
  const initialTs = get(data).groove.timeSignature

  const COMMON_TIME_SIGS: Array<{ beats: number; noteValue: 2 | 4 | 8 | 16 }> =
    [
      { beats: 4, noteValue: 4 },
      { beats: 3, noteValue: 4 },
      { beats: 2, noteValue: 4 },
      { beats: 6, noteValue: 8 },
      { beats: 5, noteValue: 4 },
      { beats: 7, noteValue: 8 },
    ]

  let open = $state(false)
  let customBeats = $state(initialTs.beats)
  let customNoteValue = $state<2 | 4 | 8 | 16>(initialTs.noteValue)

  const label = $derived(
    `${$data.groove.timeSignature.beats}/${$data.groove.timeSignature.noteValue}`,
  )

  function apply(beats: number, noteValue: 2 | 4 | 8 | 16) {
    data.setTimeSignature({ beats, noteValue })
    open = false
  }

  function applyCustom(e: Event) {
    e.preventDefault()
    apply(Math.min(32, Math.max(1, customBeats)), customNoteValue)
  }

  function syncCustomFromGroove() {
    customBeats = $data.groove.timeSignature.beats
    customNoteValue = $data.groove.timeSignature.noteValue
  }
</script>

<Popover.Root
  bind:open
  onOpenChange={(next) => {
    if (next) syncCustomFromGroove()
  }}
>
  <Popover.Trigger
    class={cn(
      buttonVariants({ variant: 'secondary', size: 'sm' }),
      'h-8 text-xs font-semibold',
    )}
  >
    {label}
  </Popover.Trigger>
  <Popover.Content align="start" class="w-auto min-w-48">
    <div class="flex flex-wrap gap-1">
      {#each COMMON_TIME_SIGS as t (t.beats + '/' + t.noteValue)}
        {@const active =
          $data.groove.timeSignature.beats === t.beats &&
          $data.groove.timeSignature.noteValue === t.noteValue}
        <Button
          variant={active ? 'default' : 'secondary'}
          size="lg"
          class="text-xs font-semibold"
          onclick={() => apply(t.beats, t.noteValue)}
        >
          {t.beats}/{t.noteValue}
        </Button>
      {/each}
    </div>
    <form
      class="border-border mt-2 flex items-center gap-2 border-t pt-2"
      onsubmit={applyCustom}
    >
      <span class="text-muted-foreground text-xs font-semibold">Custom</span>
      <Input
        type="number"
        min="1"
        max="32"
        bind:value={customBeats}
        class="border-border bg-background h-8 w-14 rounded-md px-1.5 text-sm"
      />
      <span class="text-muted-foreground">/</span>
      <select
        bind:value={customNoteValue}
        class="border-border bg-background text-foreground h-8 rounded-md border px-1.5 text-sm"
      >
        <option value={2}>2</option>
        <option value={4}>4</option>
        <option value={8}>8</option>
        <option value={16}>16</option>
      </select>
      <Button type="submit" size="sm" class="text-xs font-semibold">Set</Button>
    </form>
  </Popover.Content>
</Popover.Root>
