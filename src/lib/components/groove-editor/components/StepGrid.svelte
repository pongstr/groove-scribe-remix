<script lang="ts">
  import StepGridLane from '$lib/components/groove-editor/components/StepGridLane.svelte'
  import StepGridMeasureIndicator from '$lib/components/groove-editor/components/StepGridMeasureIndicator.svelte'
  import { getDataContext, getUIContext } from '$lib/utils/context'

  let data = getDataContext()
  let ui = getUIContext()

  const mainLanes = ['hihat', 'snare', 'kick'] as const
  const tomLanes = ['tom1', 'tom2', 'tom3', 'tom4'] as const
</script>

<div class="bg-background flex w-max min-w-auto flex-col">
  <StepGridMeasureIndicator />

  {#each mainLanes as lane (lane)}
    <StepGridLane {lane} onClear={() => data.clearLane(lane)} />
  {/each}

  {#if $data.groove.showToms}
    {#each tomLanes as lane (lane)}
      <StepGridLane {lane} onClear={() => data.clearLane(lane)} />
    {/each}
  {/if}

  {#if $ui.stickingMode !== 'off'}
    <StepGridLane lane="sticking" onClear={() => data.clearLane('sticking')} />
  {/if}
</div>
