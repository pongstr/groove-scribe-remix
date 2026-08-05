<script lang="ts">
  import {
    mergeProps,
    type TooltipContentProps,
    type TooltipRootProps,
  } from 'bits-ui'
  import type { ComponentProps, Snippet } from 'svelte'

  import { Toggle } from '$lib/components/ui/toggle'
  import * as Tooltip from '$lib/components/ui/tooltip/index'

  // Extend the exact props from your shadcn-svelte Toggle component
  type Props = {
    children?: Snippet
    content?: string
    tooltipRootProps?: TooltipRootProps
    tooltipContentProps?: TooltipContentProps
  } & ComponentProps<typeof Toggle>

  let {
    children,
    content,
    tooltipRootProps,
    tooltipContentProps,
    ...toggleProps
  }: Props = $props()
</script>

<Tooltip.Provider>
  <Tooltip.Root {...tooltipRootProps}>
    <Tooltip.Trigger>
      {#snippet child({ props: tooltipProps })}
        <Toggle {...mergeProps(tooltipProps, toggleProps)}>
          {@render children?.()}
        </Toggle>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content sideOffset={12} {...tooltipContentProps}>
      {content}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
