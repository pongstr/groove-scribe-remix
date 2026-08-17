<script lang="ts">
  import { onMount } from 'svelte'

  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { createShortcutKeydownHandler } from '$lib/utils/shortcuts/dispatch'

  const ui = getUIContext()
  const data = getDataContext()
  const onKeydown = createShortcutKeydownHandler(ui, data)

  onMount(() => {
    ui.toggleHelp(false)
    ui.closePermutations()
    ui.toggleShortcuts(false)

    window.addEventListener('keydown', onKeydown, true)
    return () => {
      window.removeEventListener('keydown', onKeydown, true)
    }
  })
</script>
