<script lang="ts">
  import AppLayout from '$lib/components/app-layout/AppLayout.svelte'
  import GrooveEditor from '$lib/components/groove-editor/GrooveEditor.svelte'
  import GrooveNotation from '$lib/components/groove-notation/GrooveNotation.svelte'
  import GrooveToolbar from '$lib/components/groove-toolbar/GrooveToolbar.svelte'

  const ReloadPromptComponent =
    import('../lib/components/pwa/ReloadPrompt.svelte')
</script>

<AppLayout>
  <GrooveToolbar />
  <GrooveNotation />
  <GrooveEditor />
</AppLayout>

{#await ReloadPromptComponent then { default: ReloadPrompt }}
  <ReloadPrompt />
{/await}
