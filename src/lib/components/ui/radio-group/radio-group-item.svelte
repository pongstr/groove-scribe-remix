<script lang="ts">
  import { RadioGroup as RadioGroupPrimitive } from 'bits-ui'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> = $props()
</script>

<RadioGroupPrimitive.Item
  bind:ref
  data-slot="radio-group-item"
  class={cn(
    'border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-foreground group/radio-group-item peer relative flex aspect-square size-4.5 shrink-0 rounded-full border border bg-transparent outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2',
    className,
  )}
  {...restProps}
>
  {#snippet children({ checked })}
    <div
      data-slot="radio-group-indicator"
      class="flex size-4.5 items-center justify-center"
    >
      {#if checked}
        <CircleIcon
          class="bg-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      {/if}
    </div>
  {/snippet}
</RadioGroupPrimitive.Item>
