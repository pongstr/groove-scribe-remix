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
  <circle cx="12" cy="14" r="4.5" />
  <path
    d="M8 6.5 L16 11.5 M8 9.5 L16 14.5"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
