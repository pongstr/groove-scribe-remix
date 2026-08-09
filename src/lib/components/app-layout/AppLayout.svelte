<script lang="ts">
  import { onMount, type Snippet } from 'svelte'

  import AppDocuments from '$lib/components/app-documents/AppDocuments.svelte'
  import CountInOverlay from '$lib/components/groove-notation/components/CountInOverlay.svelte'
  import HelpDocs from '$lib/components/help-docs/HelpDocs.svelte'
  import KeyboardShortcutsHost from '$lib/components/keyboard-shortcuts/KeyboardShortcutsHost.svelte'
  import KeyboardShortcutsModal from '$lib/components/keyboard-shortcuts/KeyboardShortcutsModal.svelte'
  // TODO: do not forget this feature exists
  // import PermutationsPanel from '$lib/components/PermutationsPanel/PermutationsPanel.svelte';
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { applyUiPrefsToGroove } from '$lib/utils/shortcuts'
  import {
    defaultEditorGroove,
    seedGroovesIfEmpty,
  } from '$lib/utils/storage/seed-grooves'

  type Props = { children?: Snippet }

  let props: Props = $props()
  let data = getDataContext()
  let ui = getUIContext()

  let restored = $state(false)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  onMount(async () => {
    await seedGroovesIfEmpty()

    const hasDraft = await data.restoreDraft()
    if (!hasDraft) {
      const groove = defaultEditorGroove()
      data.load(groove, groove.name)
    }

    await data.restoreHistory()

    applyUiPrefsToGroove(ui, data, { quiet: true })
    restored = true
  })

  $effect(() => {
    void $data.groove

    if (!restored) return

    if (saveTimer) clearTimeout(saveTimer)

    // So play/pause does not re-arm this effect — only groove edits do.
    if ($data.playback.isPlaying) {
      void data.saveDraftNow()
      return
    }

    saveTimer = setTimeout(() => void data.saveDraftNow(), 500)
  })
</script>

<svelte:head>
  <title>GrooveScribe Remix</title>
</svelte:head>

<main class="relative h-screen max-h-screen w-screen overflow-hidden">
  {@render props.children?.()}
</main>

<div class="no-print">
  <KeyboardShortcutsHost />
  <HelpDocs />
  <AppDocuments />
  <KeyboardShortcutsModal />
  <CountInOverlay />
</div>
