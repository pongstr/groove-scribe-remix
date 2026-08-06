<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Drawer from '$lib/components/ui/drawer'
  import { Input } from '$lib/components/ui/input'
  import { cn } from '$lib/utils'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { PRESET_CATEGORIES, presetsByCategory } from '$lib/utils/presets'
  import * as db from '$lib/utils/storage/db'
  import {
    downloadGrooveAsJson,
    parseGrooveJsonFile,
  } from '$lib/utils/storage/share'
  import type { PresetGroove, SavedGroove } from '$lib/utils/types'

  const data: App.Groove.ContextStore = getDataContext()
  const ui = getUIContext()

  let savedGrooves = $state<SavedGroove[]>([])
  let loading = $state(false)
  let search = $state('')
  let renamingId = $state<string | null>(null)
  let renameValue = $state('')
  let saveNameValue = $state('')
  let fileInput: HTMLInputElement | undefined = $state()
  let errorMessage = $state<string | null>(null)

  async function refresh() {
    const showLoading = savedGrooves.length === 0
    if (showLoading) loading = true
    try {
      savedGrooves = await db.listGrooves()
    } finally {
      loading = false
    }
  }

  let wasDrawerOpen = false

  $effect(() => {
    const open = $ui.drawer.open
    if (open && !wasDrawerOpen) {
      void refresh()
      saveNameValue = $data.groove.name || ''
      errorMessage = null
    }
    wasDrawerOpen = open
  })

  const filteredGrooves = $derived(
    savedGrooves.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()),
    ),
  )

  async function handleSave() {
    const name = saveNameValue.trim() ?? 'Untitled Groove'
    const record = await db.saveGroove(name, $data.groove, $data.groove.id)

    data.applySavedRecord(record)
    ui.syncQueueGroove(record.id, record.name, record.data)

    await refresh()
  }

  async function handleSaveAsNew() {
    const name = saveNameValue.trim() ?? 'Untitled Groove'
    const record = await db.saveGroove(name, $data.groove, null)

    data.applySavedRecord(record)
    ui.syncQueueGroove(record.id, record.name, record.data)

    await refresh()
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

  function handleLoadPreset(preset: PresetGroove) {
    data.load(preset.data, preset.name)
    ui.closeDrawer()
  }

  async function handleSavePresetToMine(preset: PresetGroove) {
    await db.saveGroove(preset.name, preset.data, null)
    await refresh()
    ui.setDrawerTab('mine')
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
      data.load(imported, imported.name || 'Imported Groove')
      ui.closeDrawer()
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : 'Could not import that file.'
    } finally {
      input.value = ''
    }
  }

  function formatRelativeTime(ts: number): string {
    const diffSeconds = Math.round((Date.now() - ts) / 1000)
    if (diffSeconds < 60) return 'just now'
    const diffMinutes = Math.round(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.round(diffHours / 24)
    return `${diffDays}d ago`
  }

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
    <div
      class="bg-popover text-popover-foreground relative z-10 flex h-full min-h-0 flex-col gap-3 overflow-hidden p-2"
    >
      <Drawer.Header
        class="flex-row items-center justify-between gap-2 p-0 text-left"
      >
        <Drawer.Title>Grooves</Drawer.Title>
        <Drawer.Description class="sr-only"
          >Browse and manage saved grooves and presets</Drawer.Description
        >
        <Drawer.Close
          class={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
          aria-label="Close"
        >
          ✕
        </Drawer.Close>
      </Drawer.Header>

      <div class="bg-muted flex gap-1 rounded-xl p-1">
        <button
          type="button"
          class={cn(
            'flex-1 cursor-pointer rounded-lg border-none px-2 py-1.5 text-sm font-bold',
            $ui.drawer.tab === 'mine'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground bg-transparent',
          )}
          onclick={() => ui.setDrawerTab('mine')}
        >
          My Grooves
        </button>
        <button
          type="button"
          class={cn(
            'flex-1 cursor-pointer rounded-lg border-none px-2 py-1.5 text-sm font-bold',
            $ui.drawer.tab === 'presets'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground bg-transparent',
          )}
          onclick={() => ui.setDrawerTab('presets')}
        >
          Presets
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        {#if $ui.drawer.tab === 'mine'}
          <div
            class="bg-muted/40 mb-2.5 flex flex-col gap-1.5 rounded-xl p-2.5"
          >
            <Input
              type="text"
              bind:value={saveNameValue}
              placeholder="Groove name"
            />
            <div class="flex gap-1.5">
              <Button
                type="button"
                class="flex-1"
                size="sm"
                onclick={handleSave}
              >
                {$data.groove.id ? 'Save' : 'Save to My Grooves'}
              </Button>
              {#if $data.groove.id}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onclick={handleSaveAsNew}
                >
                  Save as new
                </Button>
              {/if}
            </div>
          </div>

          <div class="mb-2.5 flex gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onclick={triggerImport}
            >
              Import JSON
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onclick={() => downloadGrooveAsJson($data.groove)}
            >
              Export current
            </Button>
            <input
              bind:this={fileInput}
              type="file"
              accept="application/json,.json"
              class="hidden"
              onchange={handleImportFile}
            />
          </div>
          {#if errorMessage}
            <p class="text-destructive mb-2 text-xs">{errorMessage}</p>
          {/if}

          <Input
            type="search"
            bind:value={search}
            placeholder="Search my grooves…"
            class="mb-2.5"
          />

          <div class="flex flex-col gap-1.5">
            {#if loading}
              <p class="text-muted-foreground px-1 py-4 text-center text-sm">
                Loading…
              </p>
            {:else if filteredGrooves.length === 0}
              <p class="text-muted-foreground px-1 py-4 text-center text-sm">
                {savedGrooves.length === 0
                  ? "You haven't saved any grooves yet. Build one and hit Save above!"
                  : 'No grooves match your search.'}
              </p>
            {:else}
              {#each filteredGrooves as record (record.id)}
                <div
                  class={cn(
                    'border-border flex items-center gap-1 rounded-xl border',
                    $data.groove.id === record.id &&
                      'border-primary/40 bg-primary/5',
                  )}
                >
                  {#if renamingId === record.id}
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
                        class="flex-1"
                      />
                      <Button type="submit" size="xs">Save</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onclick={() => (renamingId = null)}>Cancel</Button
                      >
                    </form>
                  {:else}
                    <button
                      type="button"
                      class="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 border-none bg-transparent px-2.5 py-2 text-left"
                      onclick={() => handleLoad(record)}
                    >
                      <span
                        class="text-foreground w-full truncate text-sm font-bold"
                        >{record.name}</span
                      >
                      <span class="text-muted-foreground text-xs"
                        >{formatRelativeTime(record.updatedAt)}</span
                      >
                    </button>
                    <div class="flex shrink-0 gap-0.5 pr-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onclick={() => startRename(record)}
                        title="Rename">✎</Button
                      >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onclick={() => handleDuplicate(record)}
                        title="Duplicate">⧉</Button
                      >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onclick={() => handleExportSaved(record)}
                        title="Export JSON">⭳</Button
                      >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        class="hover:text-destructive"
                        onclick={() => handleDelete(record)}
                        title="Delete"
                      >
                        🗑
                      </Button>
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-1.5">
            {#each PRESET_CATEGORIES as category (category)}
              <div
                class="text-muted-foreground mt-2 mb-0.5 text-[0.7rem] font-extrabold tracking-wider uppercase"
              >
                {category}
              </div>
              {#each presetsByCategory(category) as preset (preset.id)}
                <div
                  class="border-border flex items-center gap-1 rounded-xl border"
                >
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 border-none bg-transparent px-2.5 py-2 text-left"
                    onclick={() => handleLoadPreset(preset)}
                  >
                    <span
                      class="text-foreground w-full truncate text-sm font-bold"
                      >{preset.name}</span
                    >
                    <span class="text-muted-foreground text-xs">
                      {preset.data.timeSignature.beats}/{preset.data
                        .timeSignature.noteValue}
                    </span>
                  </button>
                  <div class="flex shrink-0 gap-0.5 pr-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onclick={() => handleSavePresetToMine(preset)}
                      title="Save a copy to My Grooves"
                    >
                      +
                    </Button>
                  </div>
                </div>
              {/each}
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
