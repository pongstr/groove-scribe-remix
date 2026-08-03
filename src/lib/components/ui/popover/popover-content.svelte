<script lang="ts">
  import { Popover as PopoverPrimitive } from 'bits-ui'
  import type { ComponentProps } from 'svelte'

  import PopoverPortal from './popover-portal.svelte'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    sideOffset = 4,
    align = 'start',
    portalProps,
    class: className,
    ...restProps
  }: PopoverPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>
  } = $props()
</script>

<PopoverPortal {...portalProps}>
  <PopoverPrimitive.Content
    bind:ref
    data-slot="popover-content"
    {sideOffset}
    {align}
    class={cn(
      'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/5 dark:ring-foreground/10 text-popover-foreground bg-popover/70 relative z-50 w-auto min-w-32 animate-none! overflow-x-hidden overflow-y-auto rounded-2xl p-2 shadow-lg ring-1 duration-100 outline-none before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150',
      className,
    )}
    {...restProps}
  />
</PopoverPortal>
