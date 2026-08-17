<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

  // import { Button } from '$lib/components/ui/button'

  const registerOptions = {
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (!registration) return

      setInterval(() => void registration.update(), 60 * 60 * 1000)
    },
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed', error)
    },
  } satisfies RegisterSWOptions

  const {
    needRefresh: needsToRefresh,
    updateServiceWorker,
    offlineReady,
  } = useRegisterSW(registerOptions)

  let visible = $derived($offlineReady || $needsToRefresh)

  function dismiss() {
    offlineReady.set(false)
    needsToRefresh.set(false)
  }

  function reload() {
    void updateServiceWorker(true)
  }

  $effect(() => {
    if (visible && $needsToRefresh) {
      toast('New updates available.', {
        duration: Infinity,
        action: {
          label: 'Reload',
          onClick: reload,
        },
        cancel: {
          label: 'Dismiss',
          onClick: dismiss,
        },
      })
      return
    }

    if (visible && !$needsToRefresh) {
      toast.info('GrooveScribe can be used offline.')
      return
    }
  })
</script>
