<script lang="ts">
  import dayjs from 'dayjs'
  import {
    Copy,
    FileDown,
    FileInput,
    FileUp,
    Save,
    SquarePen,
    Trash2,
    X,
  } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group/index'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import * as db from '$lib/utils/storage/db'
  import {
    downloadGrooveAsJson,
    parseGrooveJsonFile,
  } from '$lib/utils/storage/share'
  import type { SavedGroove } from '$lib/utils/types'

  const SHOWS_FILTER_INPUT_COUNT = 20

  let data: App.Groove.ContextStore = getDataContext()
  let ui = getUIContext()

  let savedGrooves = $state<SavedGroove[]>([])
  let loading = $state(false)
  let search = $state('')
  let renamingId = $state<string | null>(null)
  let renameValue = $state('')

  let fileInput: HTMLInputElement | undefined = $state()
  let errorMessage = $state<string | null>(null)

  const filteredGrooves = $derived(
    savedGrooves.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()),
    ),
  )

  async function refresh() {
    const showLoading = savedGrooves.length === 0
    if (showLoading) loading = true
    try {
      savedGrooves = await db.listGrooves()
    } finally {
      loading = false
    }
  }

  function handleLoad(record: SavedGroove) {
    data.load(record.data, record.name)
    data.update((s) => ({
      ...s,
      groove: { ...s.groove, id: record.id },
      dirty: false,
    }))
    ui.closeDrawer()
  }

  async function handleDelete(record: SavedGroove) {
    if (!confirm(`Delete "${record.name}"? This can't be undone.`)) return
    await db.deleteGroove(record.id)
    if ($data.groove.id === record.id) data.newGroove()
    await refresh()
  }

  async function handleDuplicate(record: SavedGroove) {
    await db.duplicateGroove(record.id)
    await refresh()
  }

  function startRename(record: SavedGroove) {
    renamingId = record.id
    renameValue = record.name
  }

  async function commitRename() {
    if (!renamingId) return
    const name = renameValue.trim()
    if (name) {
      const record = await db.renameGroove(renamingId, name)
      if ($data.groove.id === renamingId) {
        data.update((s) => ({
          ...s,
          groove: { ...s.groove, name },
          sourceLabel: name,
        }))
      }
      if (record) {
        ui.syncQueueGroove(record.id, record.name, record.data)
      }
    }
    renamingId = null
    await refresh()
  }

  function handleExportSaved(record: SavedGroove) {
    downloadGrooveAsJson(record.data)
  }

  function triggerImport() {
    fileInput?.click()
  }

  async function handleImportFile(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    try {
      errorMessage = null
      const imported = await parseGrooveJsonFile(file)
      data.load(imported, imported.name ?? 'Imported Groove')
      ui.closeDrawer()
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : 'Could not import that file.'
    } finally {
      input.value = ''
    }
  }

  function formatRelativeTime(ts: number): string {
    return dayjs(ts).fromNow()
  }

  $effect(() => {
    if ($ui.drawer.open) {
      void refresh()
      errorMessage = null
    }
  })
</script>

<ButtonGroup.Root class="w-full">
  <Button
    size="sm"
    type="button"
    class="flex-1 gap-3"
    variant="secondary"
    onclick={triggerImport}
  >
    <FileUp class="size-4" />
    <span>Import JSON</span>
  </Button>

  <Button
    type="button"
    size="sm"
    variant="secondary"
    class="flex-1 gap-3"
    onclick={() => downloadGrooveAsJson($data.groove)}
  >
    <FileDown class="size-4" />
    <span>Export JSON</span>
  </Button>

  <input
    bind:this={fileInput}
    type="file"
    accept="application/json,.json"
    class="hidden"
    onchange={handleImportFile}
  />
</ButtonGroup.Root>

{#if errorMessage}
  <p class="text-destructive mb-2 text-xs">{errorMessage}</p>
{/if}

{#if savedGrooves.length >= SHOWS_FILTER_INPUT_COUNT}
  <Input
    type="search"
    bind:value={search}
    placeholder="Search my grooves…"
    class="mb-2.5"
  />
{/if}

<div class="flex flex-col gap-1.5">
  {#if loading}
    <p class="text-muted-foreground px-1 py-4 text-center text-sm">Loading…</p>
  {:else if filteredGrooves.length === 0}
    <p class="text-muted-foreground px-1 py-4 text-center text-sm">
      {savedGrooves.length === 0
        ? "You haven't saved any grooves yet. Build one and hit Save above!"
        : 'No grooves match your search.'}
    </p>
  {/if}

  {#if !loading}
    {#each filteredGrooves as record (record.id)}
      <div
        class={cn(
          'border-border flex items-center gap-1 rounded-xl border p-1',
          $data.groove.id === record.id && 'border-primary/40 bg-primary/5',
        )}
      >
        {#if renamingId === record.id}
          {@render GrooveRenameForm()}
        {/if}

        {#if renamingId !== record.id}
          {@render GrooveItem(record)}
        {/if}
      </div>
    {/each}
  {/if}
</div>

{#snippet GrooveRenameForm()}
  <form
    class="flex w-full items-center gap-1.5 p-1.5"
    onsubmit={(e) => {
      e.preventDefault()
      commitRename()
    }}
  >
    <Input
      type="text"
      bind:value={renameValue}
      class="border-secondary flex-1 border px-2"
    />

    <div class="flex items-center justify-end gap-1">
      <Button type="submit" size="icon">
        <Save class="size-4" />
      </Button>

      <ButtonWithTooltip
        size="icon"
        type="button"
        content="Cancel"
        variant="secondary"
        onclick={() => (renamingId = null)}
        tooltipContentProps={{ side: 'top', sideOffset: 8, align: 'end' }}
      >
        <X class="size-4" />
      </ButtonWithTooltip>
    </div>
  </form>
{/snippet}

{#snippet GrooveItem(item: SavedGroove)}
  <button
    type="button"
    class="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 border-none bg-transparent px-2.5 py-2 text-left"
    onclick={() => handleLoad(item)}
  >
    <span class="text-foreground w-full truncate text-sm font-bold">
      {item.name}
    </span>

    <span class="text-muted-foreground text-xs">
      {formatRelativeTime(item.updatedAt)}
    </span>
  </button>

  <div class="flex shrink-0 items-center justify-end">
    <ButtonWithTooltip
      size="icon"
      type="button"
      variant="ghost"
      content="Rename"
      onclick={() => startRename(item)}
      tooltipContentProps={{ side: 'top', sideOffset: 8, align: 'end' }}
    >
      <SquarePen class="size-4" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      size="icon"
      type="button"
      variant="ghost"
      content="Duplicate"
      onclick={() => handleDuplicate(item)}
      tooltipContentProps={{ side: 'top', sideOffset: 8, align: 'end' }}
    >
      <Copy class="size-4" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      type="button"
      variant="ghost"
      size="icon"
      content="Export JSON"
      onclick={() => handleExportSaved(item)}
      tooltipContentProps={{ side: 'top', sideOffset: 8, align: 'end' }}
    >
      <FileInput class="size-4" />
    </ButtonWithTooltip>

    <ButtonWithTooltip
      size="icon"
      type="button"
      variant="ghost"
      content="Delete"
      class="hover:text-destructive"
      onclick={() => handleDelete(item)}
      tooltipContentProps={{ side: 'top', sideOffset: 8, align: 'end' }}
    >
      <Trash2 class="size-4" />
    </ButtonWithTooltip>
  </div>
{/snippet}
