<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { MAX_MEASURES } from '$lib/utils/config'
  import { getDataContext } from '$lib/utils/context'

  let data = getDataContext()
</script>

<div class="bg-muted flex items-center rounded-lg">
  <Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground hover:bg-background rounded-md"
    disabled={$data.groove.measures <= 1}
    onclick={() => data.setMeasures($data.groove.measures - 1)}
    aria-label="Remove measure"
  >
    <Minus class="size-4" />
  </Button>

  <span class="text-foreground w-16 text-center text-xs font-semibold">
    {$data.groove.measures}
  </span>

  <Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground hover:bg-background rounded-md"
    disabled={$data.groove.measures >= MAX_MEASURES}
    onclick={() => data.setMeasures($data.groove.measures + 1)}
    aria-label="Add measure"
  >
    <Plus class="size-4" />
  </Button>
</div>
