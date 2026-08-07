<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

  import { Button } from '$lib/components/ui/button'

  const registerOptions = {
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (!registration) return

      setInterval(
        () => {
          void registration.update()
        },
        60 * 60 * 1000,
      )
    },
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed', error)
    },
  } satisfies RegisterSWOptions

  const { needRefresh, updateServiceWorker, offlineReady } =
    useRegisterSW(registerOptions)

  let visible = $derived($offlineReady || $needRefresh)

  function dismiss() {
    offlineReady.set(false)
    needRefresh.set(false)
  }

  function reload() {
    void updateServiceWorker(true)
  }
</script>

{#if visible}
  <div
    class="border-border bg-background/95 fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm"
    role="alert"
  >
    <p class="text-foreground text-sm">
      {#if $needRefresh}
        A new version of GrooveScribe Remix is available.
      {:else}
      GrooveScribe Remix is ready to work offline.
      {/if}
    </p>

    <div class="flex flex-wrap gap-2">
      {#if $needRefresh}
        <Button size="sm" onclick={reload}>Reload</Button>
      {/if}
      <Button size="sm" variant="outline" onclick={dismiss}>Dismiss</Button>
    </div>
  </div>
{/if}
