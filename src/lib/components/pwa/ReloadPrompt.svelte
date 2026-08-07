<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte'

  import { Button } from '$lib/components/ui/button'

  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return

      setInterval(
        () => {
          void registration.update()
        },
        60 * 60 * 1000,
      )
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })

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
        A new version of Groove Studio is available.
      {:else}
        Groove Studio is ready to work offline.
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
