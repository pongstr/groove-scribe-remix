<script lang="ts">
  import './layout.css'

  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { pwaInfo } from 'virtual:pwa-info'

  import { setDataContext, setUIContext, uiDefaults } from '$lib/utils/context'
  import { defaultEditorGroove } from '$lib/utils/storage/seed-grooves'

  dayjs.extend(relativeTime)

  const ReloadPromptComponent =
    import('../lib/components/pwa/ReloadPrompt.svelte')

  let defaultGroove = defaultEditorGroove()
  let data = setDataContext({
    groove: defaultGroove,
    sourceLabel: defaultGroove.name,
  })
  setUIContext(uiDefaults, data)

  let { children } = $props()
  let manifestHref = $derived(pwaInfo?.webManifest.href)
</script>

<svelte:head>
  {#if manifestHref}
    <link rel="manifest" href={manifestHref} />
  {/if}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="icon"
    href="/pongstr-light.svg"
    media="(prefers-color-scheme: light)"
    type="image/svg+xml"
    sizes="any"
  />
  <link
    rel="icon"
    href="/pongstr-dark.svg"
    media="(prefers-color-scheme: dark)"
    type="image/svg+xml"
    sizes="any"
  />
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

{#await ReloadPromptComponent then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}
