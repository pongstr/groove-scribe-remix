<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  let { class: className, ...rest }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  aria-hidden="true"
  class={className}
  {...rest}
>
  <path d="M8 8 L16 16" />
  <path d="M16 8 L8 16" />
  <path d="M12 5.5 V8.5" />
  <path d="M12 15.5 V18.5" />
  <path d="M5.5 12 H8.5" />
  <path d="M15.5 12 H18.5" />
</svg>
