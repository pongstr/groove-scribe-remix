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
  <path
    d="M6.5 6.5 C4.5 8.2 4.5 15.8 6.5 17.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
  />
  <path
    d="M17.5 6.5 C19.5 8.2 19.5 15.8 17.5 17.5"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
  />
  <circle cx="12" cy="12" r="4.25" />
</svg>
