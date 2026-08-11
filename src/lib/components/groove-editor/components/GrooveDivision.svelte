<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import { DIVISIONS } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  let data = getDataContext()

  let label = $derived(
    DIVISIONS.find((d) => d.value === $data.groove.division)?.label ??
      'Division',
  )

  function selectDivision(value: (typeof DIVISIONS)[number]['value']) {
    data.setDivision(value)
  }
</script>

<div class="flex flex-col gap-3 py-4">
  <div class="flex items-center justify-between gap-2">
    <span class="text-sm font-semibold">Division</span>
    <span>{label}</span>
  </div>

  <div class="grid grid-cols-2 gap-2">
    {#each DIVISIONS as div, idx (div.value)}
      <Button
        class={cn(idx === DIVISIONS.length - 1 && 'col-span-2')}
        variant={$data.groove.division === div.value ? 'default' : 'secondary'}
        onclick={() => selectDivision(div.value)}
      >
        {div.label}
      </Button>
    {/each}
  </div>
</div>
