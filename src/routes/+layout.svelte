<script lang="ts">
  import './layout.css'

  import favicon from '$lib/assets/favicon.svg'
  import { setDataContext, setUIContext, uiDefaults } from '$lib/utils/context'

  const data = setDataContext()
  setUIContext(uiDefaults, data)

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{@render children()}
