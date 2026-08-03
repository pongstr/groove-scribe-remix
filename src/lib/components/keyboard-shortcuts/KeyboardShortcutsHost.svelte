<script lang="ts">
  import { onMount } from 'svelte'

  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { createShortcutKeydownHandler } from '$lib/utils/shortcuts/dispatch'

  // Capture store refs once during component init — never recreate on reactive updates.
  const ui = getUIContext()
  const data = getDataContext()
  const onKeydown = createShortcutKeydownHandler(ui, data)

  onMount(() => {
    // Clear any stuck overlay flags from older persisted UI state.
    ui.closeHelp()
    ui.closePermutations()
    ui.closeShortcuts()

    window.addEventListener('keydown', onKeydown, true)
    return () => {
      window.removeEventListener('keydown', onKeydown, true)
    }
  })
</script>
