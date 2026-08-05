<script lang="ts">
  // import DivisionMenu from './DivisionMenu.svelte'
  // import MeasuresStepper from './MeasuresStepper.svelte'
  // import SwingControl from './SwingControl.svelte'
  // import TimeSigMenu from './TimeSigMenu.svelte'
  import { cn } from '$lib/utils'

  type Props = { class?: string }

  let props: Props = $props()
</script>

<div class={cn('flex flex-wrap items-center gap-2', props?.class)}>
  <!-- <div class="flex flex-col gap-1"> -->
  <!--   <span -->
  <!--     class="text-muted-foreground text-xs font-bold tracking-wide uppercase" -->
  <!--   > -->
  <!--     Time Signature -->
  <!--   </span> -->
  <!--   <TimeSigMenu /> -->
  <!-- </div> -->
  <!---->
  <!-- <div class="flex flex-col gap-1"> -->
  <!--   <span -->
  <!--     class="text-muted-foreground text-xs font-bold tracking-wide uppercase" -->
  <!--   > -->
  <!--     Subdivision -->
  <!--   </span> -->
  <!--   <DivisionMenu /> -->
  <!-- </div> -->
  <!---->
  <!-- <div class="flex flex-col gap-1"> -->
  <!--   <span -->
  <!--     class="text-muted-foreground text-xs font-bold tracking-wide uppercase" -->
  <!--   > -->
  <!--     Length -->
  <!--   </span> -->
  <!--   <MeasuresStepper /> -->
  <!-- </div> -->
  <!---->
  <!-- <div class="flex flex-col gap-1"> -->
  <!--   <span -->
  <!--     class="text-muted-foreground text-xs font-bold tracking-wide uppercase" -->
  <!--   > -->
  <!--     Swing -->
  <!--   </span> -->
  <!--   <SwingControl /> -->
  <!-- </div> -->
</div>
