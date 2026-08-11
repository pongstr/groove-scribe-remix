<script lang="ts">
  import { CircleQuestionMark, Keyboard } from '@lucide/svelte'

  import GithubIcon from '$lib/components/groove-toolbar/components/GithubIcon.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import { cn } from '$lib/utils'
  import { getUIContext } from '$lib/utils/context'

  type Props = {
    class?: string
  }

  let props: Props = $props()
  let ui = getUIContext()
</script>

<div class={cn('flex items-center justify-end', props.class)}>
  <ButtonWithTooltip
    variant="ghost"
    size="icon"
    class="hover:text-muted-foreground"
    onclick={() => ui.openShortcuts()}
    aria-label="Keyboard shortcuts"
    content="Hotkeys (H)"
    tooltipContentProps={{ align: 'end', sideOffset: 10 }}
  >
    <Keyboard class="size-5" />
  </ButtonWithTooltip>

  <ButtonWithTooltip
    variant="ghost"
    size="icon"
    class="hover:text-muted-foreground"
    onclick={() => ui.toggleHelp()}
    aria-label="Help and notation key"
    content="Help Docs"
    tooltipContentProps={{ align: 'end', sideOffset: 10 }}
  >
    <CircleQuestionMark class="size-5" />
  </ButtonWithTooltip>

  <ButtonWithTooltip
    variant="link"
    size="icon"
    content="Github Project"
    href="https://github.com/pongstr/groove-scribe-remix"
    class="text-foreground"
    tooltipContentProps={{ align: 'end', sideOffset: 10 }}
  >
    <GithubIcon class="size-5" />
  </ButtonWithTooltip>
</div>
