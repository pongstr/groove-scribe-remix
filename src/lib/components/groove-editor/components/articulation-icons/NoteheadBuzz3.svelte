<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  let { class: className, ...rest }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
  class={className}
  {...rest}
>
  <circle cx="12" cy="15" r="4" />
  <path
    d="M8 5 L16 10 M8 8 L16 13 M8 11 L16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
