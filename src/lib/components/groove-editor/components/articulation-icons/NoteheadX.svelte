<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  let { class: className, ...rest }: SVGAttributes<SVGSVGElement> = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.75"
  stroke-linecap="round"
  aria-hidden="true"
  class={className}
  {...rest}
>
  <path d="M7 7 L17 17" />
  <path d="M17 7 L7 17" />
</svg>
