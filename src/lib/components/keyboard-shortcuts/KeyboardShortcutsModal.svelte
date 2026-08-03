<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import { getUIContext } from '$lib/utils/context'
  import { shortcutsByGroup } from '$lib/utils/shortcuts'

  let ui = getUIContext()
  let groups = shortcutsByGroup()
</script>

<Dialog.Root
  open={$ui.shortcutsOpen}
  onOpenChange={(open) => {
    if (!open) ui.closeShortcuts()
  }}
>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Keyboard shortcuts</Dialog.Title>
      <Dialog.Description class="sr-only">
        Available keyboard shortcuts
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-5">
      {#each groups as group (group.group)}
        <section>
          <h3
            class="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase"
          >
            {group.group}
          </h3>
          <ul class="divide-border border-border divide-y rounded-lg border">
            {#each group.items as item (item.id)}
              <li
                class="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
              >
                <span class="text-foreground/90">{item.label}</span>
                <kbd
                  class="border-border bg-muted text-foreground rounded-md border px-2 py-0.5 font-mono text-xs font-semibold"
                >
                  {item.keysLabel}
                </kbd>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
