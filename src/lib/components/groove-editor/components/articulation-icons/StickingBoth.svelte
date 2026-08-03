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
  <text
    x="12"
    y="16"
    text-anchor="middle"
    font-size="9"
    font-weight="700"
    font-family="ui-sans-serif, system-ui, sans-serif">R/L</text
  >
</svg>
