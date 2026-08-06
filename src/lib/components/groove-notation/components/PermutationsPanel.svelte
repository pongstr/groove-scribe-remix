<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity'

  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { calcNotesPerMeasure, noteGroupingSize } from '$lib/utils/music-math'
  import {
    buildPermutationVariants,
    generatePracticeGroove,
    type PermutationVariant,
  } from '$lib/utils/permutations'

  const data = getDataContext()
  const ui = getUIContext()

  const groupSize = $derived(
    Math.max(
      1,
      Math.round(
        noteGroupingSize(
          calcNotesPerMeasure(
            $data.groove.division,
            $data.groove.timeSignature,
          ),
          $data.groove.timeSignature,
        ),
      ),
    ),
  )
  const variants = $derived(
    buildPermutationVariants(groupSize).filter((v) => v.id !== 'ostinato'),
  )
  const categories = ['Singles', 'Doubles', 'Triples', 'All'] as const

  let selected = new SvelteSet<string>()

  function toggle(id: string) {
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
  }

  function selectCategory(category: (typeof categories)[number]) {
    const ids = variants.filter((v) => v.category === category).map((v) => v.id)
    const allSelected = ids.every((id) => selected.has(id))
    for (const id of ids) {
      if (allSelected) selected.delete(id)
      else selected.add(id)
    }
  }

  function generate() {
    const chosen: PermutationVariant[] = variants.filter((v) =>
      selected.has(v.id),
    )
    if (chosen.length === 0) return
    const practice = generatePracticeGroove($data.groove, groupSize, chosen)
    data.load(practice, practice.name)
    ui.closePermutations()
  }
</script>

<Dialog.Root
  open={$ui.permutationsOpen}
  onOpenChange={(open) => {
    if (!open) ui.closePermutations()
  }}
>
  <Dialog.Trigger>Permutations</Dialog.Trigger>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Practice mode</Dialog.Title>
      <Dialog.Description>
        Builds a longer practice sheet: your current groove, then one extra
        measure per pattern below with bonus kick hits layered on top.
      </Dialog.Description>
    </Dialog.Header>

    {#each categories as category (category)}
      {@const items = variants.filter((v) => v.category === category)}
      {#if items.length > 0}
        <div class="mb-3.5">
          <div
            class="text-muted-foreground mb-1.5 flex items-center justify-between text-xs font-extrabold tracking-wide uppercase"
          >
            <span>{category}</span>
            <button
              type="button"
              class="text-primary cursor-pointer border-none bg-transparent text-xs font-bold tracking-normal normal-case"
              onclick={() => selectCategory(category)}
            >
              toggle all
            </button>
          </div>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5"
          >
            {#each items as variant (variant.id)}
              <label
                class="bg-muted/50 text-foreground/90 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.has(variant.id)}
                  onchange={() => toggle(variant.id)}
                />
                <span>{variant.label}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    {/each}

    <Dialog.Footer
      class="border-border mt-4 items-center justify-between border-t pt-3.5 sm:justify-between"
    >
      <span class="text-muted-foreground text-xs">
        {selected.size} pattern{selected.size === 1 ? '' : 's'} selected
      </span>
      <Button type="button" onclick={generate} disabled={selected.size === 0}>
        Generate practice sheet
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
