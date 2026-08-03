<script lang="ts">
  import { BookOpen, Drum, Expand, FilePen, Plus, Save } from '@lucide/svelte'

  import ExportMenu from '$lib/components/TopBar/ExportMenu.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  // import GrooveSettings from '$lib/components/TopBar/GrooveSettings.svelte';
  // import StripGridOptionToggle from './StripGridOptionToggle.svelte';
  import * as db from '$lib/utils/storage/db'

  const data = getDataContext()
  const ui = getUIContext()

  let isSaving = $state(false)
  let justSaved = $state(false)
  let savedTimer: ReturnType<typeof setTimeout> | null = null

  function handleNewGroove() {
    if (
      $data.dirty &&
      !confirm(
        'Start a new groove? Unsaved changes will be lost unless you save first.',
      )
    )
      return
    data.newGroove()
  }

  function handleNameInput(e: Event) {
    data.setName((e.target as HTMLInputElement).value)
  }

  async function handleSave() {
    if (isSaving) return
    isSaving = true
    try {
      const name = $data.groove.name.trim() ?? 'Untitled Groove'
      const record = await db.saveGroove(name, $data.groove, $data.groove.id)
      data.applySavedRecord(record)
      ui.syncQueueGroove(record.id, record.name, record.data)
      justSaved = true
      if (savedTimer) clearTimeout(savedTimer)
      savedTimer = setTimeout(() => {
        justSaved = false
      }, 1800)
    } catch (err) {
      console.error('Failed to save groove', err)
      alert('Could not save this groove. Please try again.')
    } finally {
      isSaving = false
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      void handleSave()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="no-print bg-card flex items-center justify-start gap-2 p-2">
  <div class="flex items-center gap-2">
    <div class="text-muted-foreground aspect-square w-7">
      <FilePen class="size-6" />
    </div>

    <Input
      type="text"
      value={$data.groove.name}
      oninput={handleNameInput}
      placeholder="Untitled Groove"
      class="text-foreground hover:border-border focus-visible:border-border focus-visible:bg-background h-8 rounded-lg text-lg font-bold"
    />

    {#if justSaved}
      <span
        class="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
      >
        Saved
      </span>
    {:else if $data.dirty}
      <span
        class="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
      >
        Unsaved
      </span>
    {/if}
    <Button
      variant="default"
      class="h-8.5 text-xs font-bold"
      onclick={handleSave}
      disabled={isSaving}
      title="Save to My Grooves (⌘S / Ctrl+S)"
    >
      <Save class="size-4" />
      {isSaving ? 'Saving…' : justSaved ? 'Saved' : 'Save'}
    </Button>
  </div>

  <div class="flex flex-1 items-center justify-start gap-2">
    <Button
      variant="secondary"
      class="h-9 gap-3 text-xs font-bold"
      onclick={handleNewGroove}
    >
      <Plus class="size-4" />
      <span>New&nbsp;</span>
    </Button>
    <Button
      variant="secondary"
      size="sm"
      class="h-9 gap-3 text-xs font-bold"
      onclick={() => ui.togglePreviewMode()}
      title="Preview mode — hide groove editor (V)"
    >
      <Expand class="size-4" />
      <span>Preview&nbsp;</span>
    </Button>

    <Button
      variant="secondary"
      size="sm"
      class="h-9 gap-3 text-xs font-bold"
      onclick={() => ui.togglePracticeMode()}
      title="Practice mode — practice queue (P)"
    >
      <Drum class="size-4" />
      <span>Practice&nbsp;</span>
    </Button>

    <Button
      variant="secondary"
      size="sm"
      class="h-9 gap-3 text-xs font-bold"
      onclick={() => ui.showDrawer('mine')}
    >
      <BookOpen class="size-4" />
      <span>Groove Library&nbsp;</span>
    </Button>

    <ExportMenu />
  </div>
</div>
