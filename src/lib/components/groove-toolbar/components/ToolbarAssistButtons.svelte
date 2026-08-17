<script lang="ts">
  import { BookOpen, CircleQuestionMark, Keyboard } from '@lucide/svelte'

  import GithubIcon from '$lib/components/groove-toolbar/components/GithubIcon.svelte'
  import ButtonWithTooltip from '$lib/components/ui/button/button-with-tooltip.svelte'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index'
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
    onclick={() => ui.toggleShortcuts(!$ui.shortcutsOpen)}
    aria-label="Keyboard shortcuts"
    content="Hotkeys (H)"
    tooltipContentProps={{ align: 'end', sideOffset: 10 }}
  >
    <Keyboard class="size-5" />
  </ButtonWithTooltip>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <ButtonWithTooltip
          {...props}
          variant="ghost"
          size="icon"
          class="hover:text-muted-foreground"
          onclick={() => ui.toggleHelp(true)}
          aria-label="Help and notation key"
          content="Help Docs"
          tooltipContentProps={{ align: 'end', sideOffset: 10 }}
        >
          <CircleQuestionMark class="size-5" />
        </ButtonWithTooltip>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-72" align="end">
      <DropdownMenu.Item onSelect={() => ui.toggleAbout(true)}>
        <span>About Groove Scribe Remix</span>
        <CircleQuestionMark class="text-muted-foreground ml-auto size-4" />
      </DropdownMenu.Item>

      <DropdownMenu.Separator />
      <DropdownMenu.Item>
        <span>Support Docs</span>
        <BookOpen class="text-muted-foreground ml-auto size-4" />
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>

  <ButtonWithTooltip
    target="_blank"
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
