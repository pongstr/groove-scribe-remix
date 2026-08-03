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
  <!-- grace note -->
  <ellipse cx="6.5" cy="13" rx="2.4" ry="3.2" transform="rotate(-25 6.5 13)" />
  <!-- primary notehead -->
  <circle cx="15.5" cy="12" r="5.25" />
</svg>
