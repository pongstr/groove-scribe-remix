<script lang="ts">
  import { version } from '../../../../package.json' with { type: 'json' }
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
        Version {version}
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
