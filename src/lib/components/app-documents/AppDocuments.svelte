<script lang="ts">
  import AppGrooves from '$lib/components/app-documents/components/AppGrooves.svelte'
  import AppPresets from '$lib/components/app-documents/components/AppPresets.svelte'
  import * as Drawer from '$lib/components/ui/drawer'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()

  function handleOpenChange(open: boolean) {
    if (!open) ui.closeDrawer()
    else ui.showDrawer($ui.drawer.tab)
  }
</script>

<Drawer.Root
  direction="left"
  open={$ui.drawer.open}
  onOpenChange={handleOpenChange}
>
  <Drawer.Content
    class="h-full w-[min(380px,100vw)] data-[vaul-drawer-direction=left]:sm:max-w-95"
  >
    <Tabs.Root
      class="max-h-full w-full"
      bind:value={$ui.drawer.tab}
      onValueChange={(value) => ui.setDrawerTab(value as App.UI.DrawerTab)}
    >
      <Tabs.List class="w-full group-data-horizontal/tabs:h-10">
        <Tabs.Trigger value="mine">My Grooves</Tabs.Trigger>
        <Tabs.Trigger value="presets">Presets</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="mine"
        class="max-h-full scrollbar-gutter-stable space-y-4 overflow-y-auto"
      >
        <AppGrooves />
      </Tabs.Content>

      <Tabs.Content
        value="presets"
        class="max-h-full scrollbar-gutter-stable space-y-4 overflow-y-auto"
      >
        <AppPresets />
      </Tabs.Content>
    </Tabs.Root>
  </Drawer.Content>
</Drawer.Root>
