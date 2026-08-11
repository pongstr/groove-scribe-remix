<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { MAX_MEASURES } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  let data = getDataContext()
</script>

<div class="flex flex-col gap-2 py-3">
  <div class="flex items-center justify-between gap-2">
    <span class="text-sm font-semibold">Measure Count</span>
  </div>

  <div
    class="bg-background/40 flex items-center justify-between gap-3 border p-1"
  >
    <Button
      variant="ghost"
      size="lg"
      class="text-muted-foreground hover:bg-background rounded-md"
      disabled={$data.groove.measures <= 1}
      onclick={() => data.setMeasures($data.groove.measures - 1)}
      aria-label="Remove measure"
    >
      <Minus class="size-6" />
    </Button>

    <span class="text-foreground w-16 text-center text-lg font-semibold">
      {$data.groove.measures}
    </span>

    <Button
      variant="ghost"
      size="lg"
      class="text-muted-foreground hover:bg-background"
      disabled={$data.groove.measures >= MAX_MEASURES}
      onclick={() => data.setMeasures($data.groove.measures + 1)}
      aria-label="Add measure"
    >
      <Plus class="size-6" />
    </Button>
  </div>
</div>
