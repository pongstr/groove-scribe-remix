<script lang="ts">
  import { onMount } from 'svelte'
  import {
    ArrowDown,
    ArrowUp,
    FolderOpen,
    ListOrdered,
    X,
  } from '@lucide/svelte'

  import { hydrateQueueItem } from '$lib/components/groove-notation/components/queue-hydrate'
  import Button from '$lib/components/ui/button/button.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as Drawer from '$lib/components/ui/drawer/index'
  import * as Tabs from '$lib/components/ui/tabs/index'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { PRESET_CATEGORIES, presetsByCategory } from '$lib/utils/presets'
  import * as db from '$lib/utils/storage/db'

  let data = getDataContext()
  let ui = getUIContext()

  let savedGrooves = $state<App.Groove.SavedGroove[]>([])
  let selectedTab = $state<'queue' | 'grooves' | 'presets'>('queue')
  let search = $state('')
  let loading = $state(false)

  let filteredSaved = $derived(
    savedGrooves.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()),
    ),
  )

  async function refresh() {
    loading = true
    try {
      savedGrooves = await db.listGrooves()
    } finally {
      loading = false
    }
  }

  function addSaved(record: App.Groove.SavedGroove) {
    ui.enqueue(record.name, record.data)
  }

  function addPreset(preset: App.Groove.PresetGroove) {
    ui.enqueue(preset.name, preset.data)
  }

  async function loadItem(index: number) {
    const item = ui.selectQueueIndex(index)

    if (!item) return

    const resolved = await hydrateQueueItem(ui, item)
    data.load(resolved.data, resolved.name, { clearHistory: false })
  }

  function onTabSwitch(value: string) {
    selectedTab = (value as 'queue' | 'grooves' | 'presets') ?? 'queue'
  }

  onMount(async () => void (await refresh()))
</script>

<Drawer.Root direction="left">
  <Drawer.Trigger>
    {#snippet child({ props })}
      <ButtonWithTooltip
        size="icon"
        variant="outline"
        content="Open Practice Queue"
        tooltipContentProps={{ align: 'start', sideOffset: 10 }}
        {...props}
      >
        <ListOrdered class="size-5" />
      </ButtonWithTooltip>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Tabs.Root value={selectedTab} class="w-full" onValueChange={onTabSwitch}>
      <Tabs.List class="w-full p-0 group-data-horizontal/tabs:h-9">
        <Tabs.Trigger value="queue" class="h-9 px-4">
          <ListOrdered class="size-4" />
          <span class="font-sans">Queue</span>
        </Tabs.Trigger>

        <Tabs.Trigger value="grooves" class="h-9 px-4">
          <FolderOpen class="size-4" />
          <span class="font-sans">My Grooves</span>
        </Tabs.Trigger>

        <Tabs.Trigger value="presets" class="h-9 px-4">
          <FolderOpen class="size-4" />
          <span class="font-sans">Presets</span>
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="queue" class="block">
        {@render QueueListTab()}
      </Tabs.Content>

      <Tabs.Content value="grooves">
        {@render MyGroovesTab()}
      </Tabs.Content>

      <Tabs.Content value="presets">
        {@render PresetsTab()}
      </Tabs.Content>
    </Tabs.Root>
  </Drawer.Content>
</Drawer.Root>

{#snippet QueueListTab()}
  {#if !$ui.practiceMode.queue.length}
    <div class="bg-muted flex flex-col items-center justify-start gap-1 py-4">
      <span class="font-sans">Queue grooves from My Grooves or Presets</span>
      <span class="text-muted-foreground text-xs">
        then step through them while you practice.
      </span>

      <div class="flex flex-col items-stretch justify-center gap-2 py-4">
        <Button
          variant="outline"
          class="h-9"
          onclick={() => onTabSwitch('grooves')}>Add from My Grooves</Button
        >
        <Button
          variant="outline"
          class="h-9"
          onclick={() => onTabSwitch('presets')}>Add from Presets</Button
        >
      </div>
    </div>
  {/if}
  <ul class="flex max-h-64 flex-col gap-1 overflow-y-auto">
    {#each $ui.practiceMode.queue as item, index (item.id)}
      <li
        class={[
          'flex items-center gap-1 rounded-lg border px-2 py-1.5',
          index === $ui.practiceMode.currentIndex
            ? 'border-primary bg-primary/10'
            : 'bg-muted/50 border-transparent',
        ]}
      >
        <button
          type="button"
          class="min-w-0 flex-1 truncate text-left text-sm font-medium"
          onclick={() => loadItem(index)}
        >
          <span class="text-muted-foreground mr-1 text-xs">{index + 1}.</span>
          {item.name}
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          onclick={() => ui.moveQueueItem(item.id, -1)}
          disabled={index === 0}
          aria-label="Move up"
        >
          <ArrowUp class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onclick={() => ui.moveQueueItem(item.id, 1)}
          disabled={index === $ui.practiceMode.queue.length - 1}
          aria-label="Move down"
        >
          <ArrowDown class="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onclick={() => ui.removeFromQueue(item.id)}
          aria-label="Remove from queue"
        >
          <X class="size-4" />
        </Button>
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet MyGroovesTab()}
  <input
    type="search"
    bind:value={search}
    placeholder="Search…"
    class="border-border bg-background w-full rounded-lg border px-2.5 py-1.5 text-sm"
  />

  {#if loading}
    <p class="text-muted-foreground text-xs">Loading…</p>
  {/if}

  {#if !loading}
    <ul class="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {#each filteredSaved as record (record.id)}
        <li class="bg-muted/50 flex items-center gap-2 rounded-lg px-2 py-1.5">
          <span class="min-w-0 flex-1 truncate text-sm">{record.name}</span>
          <button
            type="button"
            class="bg-primary text-primary-foreground shrink-0 rounded-md px-2 py-1 text-[10px] font-bold"
            onclick={() => addSaved(record)}
          >
            Queue
          </button>
        </li>
      {:else}
        <li class="text-muted-foreground text-xs">No saved grooves yet.</li>
      {/each}
    </ul>
  {/if}
{/snippet}

{#snippet PresetsTab()}
  {#each PRESET_CATEGORIES as category (category)}
    {@const presets = presetsByCategory(category).filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    )}
    {#if presets.length > 0}
      <div>
        <p
          class="text-muted-foreground mb-1 text-[10px] font-bold tracking-wide uppercase"
        >
          {category}
        </p>
        <ul class="flex flex-col gap-1">
          {#each presets as preset (preset.id)}
            <li
              class="bg-muted/50 flex items-center gap-2 rounded-lg px-2 py-1.5"
            >
              <span class="min-w-0 flex-1 truncate text-sm">{preset.name}</span>
              <button
                type="button"
                class="bg-primary text-primary-foreground shrink-0 rounded-md px-2 py-1 text-[10px] font-bold"
                onclick={() => addPreset(preset)}
              >
                Queue
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/each}
{/snippet}
