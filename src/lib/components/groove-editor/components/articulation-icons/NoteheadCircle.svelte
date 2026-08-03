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
  <circle cx="12" cy="12" r="6.5" />
</svg>
