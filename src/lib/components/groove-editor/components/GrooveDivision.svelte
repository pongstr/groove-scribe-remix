<script lang="ts">
  import { Button } from '$lib/components/ui/button'
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

  <div class="grid grid-cols-3 gap-2">
    {#each DIVISIONS as d (d.value)}
      <Button
        variant={$data.groove.division === d.value ? 'default' : 'secondary'}
        class="justify-start text-xs font-semibold"
        onclick={() => selectDivision(d.value)}
      >
        {d.label}
      </Button>
    {/each}
  </div>
</div>
