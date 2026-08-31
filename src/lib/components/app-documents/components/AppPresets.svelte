<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { PRESET_CATEGORIES, presetsByCategory } from '$lib/utils/presets'
  import * as db from '$lib/utils/storage/db'

  let data: App.Groove.ContextStore = getDataContext()
  let ui = getUIContext()

  let savedGrooves = $state<App.Groove.SavedGroove[]>([])
  let loading = $state(false)

  async function refresh() {
    const showLoading = savedGrooves.length === 0
    if (showLoading) loading = true
    try {
      savedGrooves = await db.listGrooves()
    } finally {
      loading = false
    }
  }

  function handleLoadPreset(preset: App.Groove.PresetGroove) {
    data.load(preset.data, preset.name)
    ui.closeDrawer()
  }

  async function handleSavePresetToMine(preset: App.Groove.PresetGroove) {
    await db.saveGroove(preset.name, preset.data, null)
    await refresh()
    ui.setDrawerTab('mine')
  }
</script>

{#if loading}
  Loading...
{/if}

{#each PRESET_CATEGORIES as category (category)}
  <div
    class="text-muted-foreground mt-2 mb-0.5 text-[0.7rem] font-extrabold tracking-wider uppercase"
  >
    {category}
  </div>
  {#each presetsByCategory(category) as preset (preset.id)}
    <div class="border-border flex items-center gap-1 rounded-xl border">
      <button
        type="button"
        class="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 border-none bg-transparent px-2.5 py-2 text-left"
        onclick={() => handleLoadPreset(preset)}
      >
        <span class="text-foreground w-full truncate text-sm font-bold"
          >{preset.name}</span
        >
        <span class="text-muted-foreground text-xs">
          {preset.data.timeSignature.beats}/{preset.data.timeSignature
            .noteValue}
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
