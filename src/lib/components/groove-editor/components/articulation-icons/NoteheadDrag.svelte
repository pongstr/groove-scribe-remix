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
  <!-- double grace (drag) -->
  <ellipse
    cx="4.8"
    cy="13.2"
    rx="1.8"
    ry="2.6"
    transform="rotate(-25 4.8 13.2)"
  />
  <ellipse
    cx="8.2"
    cy="12.6"
    rx="1.8"
    ry="2.6"
    transform="rotate(-25 8.2 12.6)"
  />
  <!-- primary notehead -->
  <circle cx="16.5" cy="12" r="5" />
</svg>
