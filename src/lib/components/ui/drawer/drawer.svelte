<script lang="ts">
  import { Drawer as DrawerPrimitive } from 'vaul-svelte'

  let {
    shouldScaleBackground = true,
    open = $bindable(false),
    activeSnapPoint = $bindable(null),
    direction = 'bottom',
    ...restProps
  }: DrawerPrimitive.RootProps = $props()
</script>

<DrawerPrimitive.Root
  {shouldScaleBackground}
  {direction}
  bind:open
  bind:activeSnapPoint
  {...restProps}
/>
