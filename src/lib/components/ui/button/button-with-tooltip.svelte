<script lang="ts">
  import {
    mergeProps,
    type TooltipContentProps,
    type TooltipRootProps,
  } from 'bits-ui'
  import type { Snippet } from 'svelte'

  import Button, {
    type ButtonProps,
  } from '$lib/components/ui/button/button.svelte'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'

  type Props = {
    children?: Snippet
    content?: string
    tooltipRootProps?: TooltipRootProps
    tooltipContentProps?: TooltipContentProps
  } & ButtonProps

  let {
    children,
    content,
    tooltipRootProps,
    tooltipContentProps,
    ...buttonProps
  }: Props = $props()
</script>

<Tooltip.Provider>
  <Tooltip.Root {...tooltipRootProps}>
    <Tooltip.Trigger>
      {#snippet child({ props: tooltipProps })}
        <Button {...mergeProps(tooltipProps, buttonProps)}>
          {@render children?.()}
        </Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content sideOffset={12} {...tooltipContentProps}>
      {content}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
