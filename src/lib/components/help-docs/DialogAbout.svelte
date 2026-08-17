<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index'
  import { getUIContext } from '$lib/utils/context'

  let ui = getUIContext()

  function onOpenChange(value: boolean) {
    if (!value) {
      ui.toggleAbout(value)
      return
    }
  }
</script>

<Dialog.Root open={$ui.aboutOpen} {onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>About GrooveScribe Remix</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
