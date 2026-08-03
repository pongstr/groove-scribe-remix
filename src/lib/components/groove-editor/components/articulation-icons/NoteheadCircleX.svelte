<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  let { class: className, ...rest }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.25"
  stroke-linecap="round"
  aria-hidden="true"
  class={className}
  {...rest}
>
  <circle cx="12" cy="12" r="7" />
  <path d="M9 9 L15 15" />
  <path d="M15 9 L9 15" />
</svg>
