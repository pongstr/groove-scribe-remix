<script lang="ts">
  import { cn } from 'tailwind-variants'
  import { Metronome } from '@lucide/svelte'

  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { getDataContext, getUIContext } from '$lib/utils/context'
  import { setClickSubdivision } from '$lib/utils/shortcuts'

  const ui = getUIContext()
  const data = getDataContext()

  const OPTIONS: {
    value: string
    desc: string
    label: string
    num: 0 | 4 | 8 | 16
  }[] = [
    { value: '0', label: 'Off', desc: 'Off', num: 0 },
    { value: '4', label: '♩', desc: 'Quarter note', num: 4 },
    { value: '8', label: '♪', desc: 'Eighth note', num: 8 },
    { value: '16', label: '♬ ', desc: 'Sixteenth note', num: 16 },
  ]

  const clickValue = $derived(String($ui.clickSubdivision))

  function handleValueChange(value: string | undefined) {
    if (value == null) return
    const match = OPTIONS.find((opt) => opt.value === value)
    if (!match) return
    setClickSubdivision(ui, data, match.num)
  }
</script>

<Tooltip.Provider>
  <div class="flex items-center gap-2">
    <ToggleGroup.Root
      type="single"
      variant="outline"
      size="sm"
      value={clickValue}
      onValueChange={handleValueChange}
      class="bg-muted"
    >
      {#each OPTIONS as opt (opt.value)}
        <ToggleGroup.Item
          value={opt.value}
          class="data-[state=on]:bg-background size-9 rounded-md px-2 text-xs font-semibold data-[state=on]:text-indigo-400 data-[state=on]:shadow-sm"
        >
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#if opt.value === '0'}
                <Metronome
                  class={cn(
                    'text-muted-foreground/80 size-4',
                    parseInt(clickValue, 10) > 0 && 'text-foreground',
                  )}
                />
              {:else}
                <span class="text-lg font-semibold">{opt.label}</span>
              {/if}
            </Tooltip.Trigger>

            <Tooltip.Content>
              {opt.desc}
            </Tooltip.Content>
          </Tooltip.Root>
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </div>
</Tooltip.Provider>
