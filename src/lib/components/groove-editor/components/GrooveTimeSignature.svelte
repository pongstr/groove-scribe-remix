<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte'
  import Input from '$lib/components/ui/input/input.svelte'
  import { getDataContext } from '$lib/utils/context'

  type TimeSignatureType = {
    beats: number
    noteValue: 2 | 4 | 8 | 16
  }

  const COMMON_TIME_SIGS: Array<TimeSignatureType> = [
    { beats: 4, noteValue: 4 },
    { beats: 3, noteValue: 4 },
    { beats: 2, noteValue: 4 },
    { beats: 6, noteValue: 8 },
    { beats: 5, noteValue: 4 },
    { beats: 7, noteValue: 8 },
  ]

  const data = getDataContext()
  const initialTs = $derived<App.Groove.Data['timeSignature']>(
    $data.groove.timeSignature,
  )

  let customBeats = $derived(initialTs.beats)
  let customNoteValue = $derived<TimeSignatureType['noteValue']>(
    initialTs.noteValue,
  )

  const label = $derived(
    [
      $data.groove.timeSignature.beats,
      $data.groove.timeSignature.noteValue,
    ].join('/'),
  )

  function apply(beats: number, noteValue: 2 | 4 | 8 | 16) {
    data.setTimeSignature({ beats, noteValue })
    syncCustomFromGroove()
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

<div class="flex flex-col gap-3 py-4">
  <div class="flex items-center justify-between gap-2">
    <span class="text-sm font-semibold">Time Signature</span>
    <span>{label}</span>
  </div>

  <div class="grid grid-cols-3 gap-3">
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
    class="flex flex-col items-stretch justify-start gap-2"
    onsubmit={applyCustom}
  >
    <span class="text-muted-foreground text-xs font-semibold">Custom</span>
    <div class="flex items-center justify-start gap-3">
      <Input
        type="number"
        min="1"
        max="32"
        bind:value={customBeats}
        class="border-border bg-background h-10 w-16 rounded-md px-4 text-center text-sm"
      />

      <span class="text-muted-foreground text-lg">/</span>

      <select
        bind:value={customNoteValue}
        class="border-border bg-background text-foreground h-10 w-16 rounded-md border px-4 text-sm"
      >
        <option value={2}>2</option>
        <option value={4}>4</option>
        <option value={8}>8</option>
        <option value={16}>16</option>
      </select>

      <Button
        type="submit"
        variant="outline"
        class="h-10 flex-1 text-xs font-semibold"
      >
        Set Custom Time
      </Button>
    </div>
  </form>
</div>
