<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Popover from '$lib/components/ui/popover'
  import { cn } from '$lib/utils'
  import { DIVISIONS } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  const data = getDataContext()

  let open = $state(false)

  const label = $derived(
    DIVISIONS.find((d) => d.value === $data.groove.division)?.label ??
      'Division',
  )

  function selectDivision(value: (typeof DIVISIONS)[number]['value']) {
    data.setDivision(value)
    open = false
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class={cn(
      buttonVariants({ variant: 'secondary', size: 'sm' }),
      'h-8 text-xs font-semibold',
    )}
  >
    {label}
  </Popover.Trigger>
  <Popover.Content align="start" class="flex w-auto min-w-40 flex-col gap-1">
    {#each DIVISIONS as d (d.value)}
      <Button
        variant={$data.groove.division === d.value ? 'default' : 'secondary'}
        size="sm"
        class="justify-start text-xs font-semibold"
        onclick={() => selectDivision(d.value)}
      >
        {d.label}
      </Button>
    {/each}
  </Popover.Content>
</Popover.Root>
