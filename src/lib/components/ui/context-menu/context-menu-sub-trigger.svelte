<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
  import { cn, type WithoutChild } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
    inset?: boolean
  } = $props()
</script>

<ContextMenuPrimitive.SubTrigger
  bind:ref
  data-slot="context-menu-sub-trigger"
  data-inset={inset}
  class={cn(
    "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex cursor-default items-center rounded-none px-3 py-2 text-xs font-medium tracking-wider uppercase outline-hidden select-none data-inset:ps-8 data-inset:pl-9.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
  <ChevronRightIcon class="ml-auto" />
</ContextMenuPrimitive.SubTrigger>
