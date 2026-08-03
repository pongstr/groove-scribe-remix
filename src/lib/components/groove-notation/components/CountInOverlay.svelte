<script lang="ts">
  import { getDataContext } from '$lib/utils/context'

  const data = getDataContext()
  const playhead = data.playhead

  const totalBeats = $derived($data.groove.timeSignature.beats)
  const visible = $derived(
    $data.playback.isPlaying &&
      $playhead.isCountingIn &&
      $playhead.countInBeat > 0,
  )
</script>

{#if visible}
  <div class="count-in" aria-live="assertive" aria-atomic="true">
    <div class="count-in-card">
      <span class="count-in-label">Count-in</span>
      {#key $playhead.countInBeat}
        <span class="count-in-number">{$playhead.countInBeat}</span>
      {/key}
      <span class="count-in-meta">of {totalBeats}</span>
      <div class="count-in-dots">
        {#each Array.from({ length: totalBeats }, (_, i) => i + 1) as beat (beat)}
          <span
            class="dot"
            class:active={beat === $playhead.countInBeat}
            class:passed={beat < $playhead.countInBeat}
          ></span>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .count-in {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    z-index: 60;
    background: rgb(15 23 42 / 0.18);
  }
  .count-in-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-width: 9rem;
    padding: 1.25rem 1.75rem 1rem;
    border-radius: 1.25rem;
    background: rgb(15 23 42 / 0.92);
    color: white;
    box-shadow: 0 18px 40px rgb(15 23 42 / 0.35);
    animation: pop 180ms ease-out;
  }
  .count-in-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(148 163 184);
  }
  .count-in-number {
    font-size: 4.5rem;
    line-height: 1;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    animation: beat 160ms ease-out;
  }
  .count-in-meta {
    font-size: 0.75rem;
    color: rgb(148 163 184);
    margin-bottom: 0.35rem;
  }
  .count-in-dots {
    display: flex;
    gap: 0.4rem;
  }
  .dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: rgb(71 85 105);
    transition:
      background 120ms ease,
      transform 120ms ease;
  }
  .dot.passed {
    background: rgb(148 163 184);
  }
  .dot.active {
    background: #f59e0b;
    transform: scale(1.35);
  }
  @keyframes pop {
    from {
      transform: scale(0.92);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes beat {
    from {
      transform: scale(1.18);
    }
    to {
      transform: scale(1);
    }
  }
</style>
