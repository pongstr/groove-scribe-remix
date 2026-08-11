// Lookahead Web Audio scheduler. Owned by the Data context — not a public singleton.
import {
  COUNT_IN_SAMPLES,
  LANE_ARTICULATION_META,
  METRONOME_SAMPLE,
  TOM_SAMPLES,
} from '../config'
import type { App, LoopMode } from '../context/types'
import {
  calcNotesPerMeasure,
  isUpbeatSlot,
  swingDelaySeconds,
} from '../music-math'
import { slotAbsoluteMs } from '../tuplet-timing'
import type { GrooveData, LaneId, Slot } from '../types'
import { sampleLibrary } from './sample-library'

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SECONDS = 0.12
const START_DELAY_SECONDS = 0.08
const CLICK_DOWNBEAT_RATE = 1.25
const CLICK_OTHER_RATE = 0.82
const MASTER_GAIN = 0.9
const NOTE_LANES: LaneId[] = [
  'hihat',
  'snare',
  'kick',
  'tom1',
  'tom2',
  'tom3',
  'tom4',
]

interface UiEvent {
  index: number
  time: number
  countBeat?: number
}

export interface SchedulerHost {
  getGroove: () => GrooveData
  getSlotMs: () => number
  getTotalSlots: () => number
  getCell: (lane: LaneId, index: number) => Slot
  getLoop: () => LoopMode
  getCountInEnabled: () => boolean
  getIsPlaying: () => boolean
  getLoadReady: () => boolean
  getCurrentSlot: () => number
  getIsCountingIn: () => boolean
  patchPlayback: (partial: Partial<App.Data.PlaybackState>) => void
  patchPlayhead: (partial: Partial<App.Data.PlayheadState>) => void
  notifyNaturalEnd: (chainAt: number) => void
  onStopped: () => void
}

export function createScheduler(host: SchedulerHost) {
  let ctx: AudioContext | null = null
  let masterGain: GainNode | null = null
  /** Independent of transport mute — cell input auditions while paused. */
  let previewGain: GainNode | null = null
  let timerId: ReturnType<typeof setInterval> | null = null
  let rafId: number | null = null
  let nextNoteIndex = 0
  let nextNoteTime = 0
  let finished = false
  let grooveStartTime = 0
  let countInBeatsTotal = 0
  let countInNextBeat = 0
  let countInNextTime = 0
  let metronomeNextTime = 0
  let metronomeTickCounter = 0
  /** Tracks subdivision so live changes can resync click timing to the groove. */
  let lastMetronomeSubdivision: 0 | 4 | 8 | 16 | null = null
  let uiEvents: UiEvent[] = []
  /** Slot to resume from after pause; null means start from the beginning. */
  let resumeSlot: number | null = null
  let naturalEndTimer: ReturnType<typeof setTimeout> | null = null

  function clearNaturalEndTimer(): void {
    if (naturalEndTimer !== null) {
      clearTimeout(naturalEndTimer)
      naturalEndTimer = null
    }
  }

  function ensureContext(): AudioContext {
    if (!ctx) {
      const AudioContextCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      ctx = new AudioContextCtor()
      sampleLibrary.setContext(ctx)
      masterGain = ctx.createGain()
      masterGain.gain.value = MASTER_GAIN
      masterGain.connect(ctx.destination)
      previewGain = ctx.createGain()
      previewGain.gain.value = MASTER_GAIN
      previewGain.connect(ctx.destination)
    }
    return ctx
  }

  function setAudible(audible: boolean): void {
    if (masterGain) masterGain.gain.value = audible ? MASTER_GAIN : 0
  }

  function clearTransportTimers(): void {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    clearNaturalEndTimer()
  }

  function playBuffer(
    sample: string,
    gain: number,
    time: number,
    playbackRate = 1,
    output?: GainNode | null,
  ): void {
    if (!sample) return
    const audio = ensureContext()
    const dest = output ?? masterGain
    if (!dest) return
    const buffer = sampleLibrary.get(sample)
    if (!buffer) return
    const source = audio.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = playbackRate
    const gainNode = audio.createGain()
    gainNode.gain.value = gain
    source.connect(gainNode)
    gainNode.connect(dest)
    source.start(Math.max(time, audio.currentTime))
  }

  async function prepare(): Promise<void> {
    const audio = ensureContext()
    if (audio.state === 'suspended') await audio.resume()
    if (host.getLoadReady()) return
    await sampleLibrary.preloadAll((loaded, total) => {
      host.patchPlayback({
        loadProgress: { loaded, total, ready: loaded === total },
      })
    })
    host.patchPlayback({
      loadProgress: { loaded: 1, total: 1, ready: true },
    })
  }

  function metronomeTickForSlot(groove: GrooveData, slot: number): number {
    const npm = calcNotesPerMeasure(groove.division, groove.timeSignature)
    const ticksPerBeat = groove.metronomeSubdivision / 4
    const slotsPerBeat = npm / groove.timeSignature.beats
    return Math.round((slot % npm) * (ticksPerBeat / slotsPerBeat))
  }

  function syncMetronomeToSlot(
    groove: GrooveData,
    slot: number,
    nextClickTime: number,
  ): void {
    if (groove.metronomeSubdivision === 0) return
    metronomeTickCounter = metronomeTickForSlot(groove, slot)
    metronomeNextTime = nextClickTime
  }

  function syncMetronomeToCurrentPosition(): void {
    const groove = host.getGroove()
    if (groove.metronomeSubdivision === 0) return
    const slot = host.getCurrentSlot()
    if (slot < 0) return
    syncMetronomeToSlot(groove, slot, ensureContext().currentTime)
  }

  function scheduleCountIn(horizon: number): void {
    if (countInNextBeat >= countInBeatsTotal) return
    const beatSeconds = 60 / host.getGroove().tempo
    while (countInNextBeat < countInBeatsTotal && countInNextTime < horizon) {
      const beatNumber = countInNextBeat + 1
      const isDownbeat = beatNumber === 1
      const clickRate = isDownbeat ? CLICK_DOWNBEAT_RATE : CLICK_OTHER_RATE
      if (beatNumber <= COUNT_IN_SAMPLES.length) {
        playBuffer(
          COUNT_IN_SAMPLES[beatNumber - 1],
          isDownbeat ? 1 : 0.85,
          countInNextTime,
        )
        playBuffer(METRONOME_SAMPLE, 0.35, countInNextTime, clickRate)
      } else {
        playBuffer(
          METRONOME_SAMPLE,
          isDownbeat ? 0.95 : 0.7,
          countInNextTime,
          clickRate,
        )
      }
      uiEvents.push({ index: -1, time: countInNextTime, countBeat: beatNumber })
      countInNextBeat += 1
      countInNextTime += beatSeconds
    }
  }

  function scheduleClick(horizon: number): void {
    const groove = host.getGroove()
    const subdivision = groove.metronomeSubdivision
    if (subdivision === 0) {
      lastMetronomeSubdivision = 0
      return
    }
    if (
      lastMetronomeSubdivision !== null &&
      lastMetronomeSubdivision !== subdivision &&
      host.getIsPlaying() &&
      !host.getIsCountingIn()
    ) {
      syncMetronomeToCurrentPosition()
    }
    lastMetronomeSubdivision = subdivision
    const intervalSeconds = (60 / groove.tempo) * (4 / subdivision)
    const ticksPerBeat = subdivision / 4
    const ticksPerMeasure = Math.max(
      1,
      Math.round(ticksPerBeat * groove.timeSignature.beats),
    )

    while (!finished && metronomeNextTime < horizon) {
      if (metronomeNextTime + 0.0001 < grooveStartTime) {
        metronomeNextTime = grooveStartTime
        metronomeTickCounter = 0
        continue
      }
      const isDownbeat = metronomeTickCounter % ticksPerMeasure === 0
      playBuffer(
        METRONOME_SAMPLE,
        isDownbeat ? 0.9 : 0.55,
        metronomeNextTime,
        isDownbeat ? CLICK_DOWNBEAT_RATE : CLICK_OTHER_RATE,
      )
      metronomeNextTime += intervalSeconds
      metronomeTickCounter += 1
    }
  }

  function slotDurationSeconds(index: number): number {
    const groove = host.getGroove()
    const groups = groove.tupletGroups ?? []
    const slotMs = host.getSlotMs()
    const next = slotAbsoluteMs(index + 1, slotMs, groups)
    const current = slotAbsoluteMs(index, slotMs, groups)
    return (next - current) / 1000
  }

  function scheduleNoteSlot(index: number, time: number): void {
    const groove = host.getGroove()
    const division = groove.division
    const slotSeconds = host.getSlotMs() / 1000
    const swungTime = isUpbeatSlot(division, index)
      ? time + swingDelaySeconds(slotSeconds, groove.swingPercent)
      : time

    for (const lane of NOTE_LANES) {
      if (lane.startsWith('tom') && !groove.showToms) continue
      const value = host.getCell(lane, index)
      if (!value) continue
      const meta = LANE_ARTICULATION_META[lane][value]
      const sample = lane.startsWith('tom')
        ? TOM_SAMPLES[Number(lane.slice(3)) - 1]
        : meta.sample
      playBuffer(sample, meta.gain, swungTime)
    }
  }

  function tick(): void {
    const audio = ensureContext()
    const horizon = audio.currentTime + SCHEDULE_AHEAD_SECONDS
    scheduleCountIn(horizon)

    while (!finished && nextNoteTime < horizon) {
      scheduleNoteSlot(nextNoteIndex, nextNoteTime)
      uiEvents.push({ index: nextNoteIndex, time: nextNoteTime })
      nextNoteTime += slotDurationSeconds(nextNoteIndex)
      nextNoteIndex += 1

      if (nextNoteIndex >= host.getTotalSlots()) {
        if (host.getLoop() === 'loop') {
          nextNoteIndex = 0
        } else {
          finished = true
          const chainAt = nextNoteTime
          const notifyDelayMs = Math.max(
            0,
            (chainAt - audio.currentTime) * 1000 + 30,
          )
          clearNaturalEndTimer()
          naturalEndTimer = setTimeout(() => {
            naturalEndTimer = null
            host.notifyNaturalEnd(chainAt)
            // Stop transport after the last note; practice mode chains in the
            // naturalEnd effect before the user sees a stuck playing state.
            stop()
          }, notifyDelayMs)
        }
      }
    }
    scheduleClick(horizon)
  }

  function runUiLoop(): void {
    const audio = ensureContext()
    const now = audio.currentTime
    let current: number | undefined
    let countBeat: number | undefined
    let countingIn: boolean | undefined

    while (uiEvents.length && uiEvents[0].time <= now) {
      const event = uiEvents.shift()!
      if (event.countBeat != null) {
        countBeat = event.countBeat
        countingIn = true
      } else {
        current = event.index
        countingIn = false
        countBeat = 0
      }
    }

    if (current !== undefined || countingIn !== undefined) {
      host.patchPlayhead({
        ...(current !== undefined ? { currentSlot: current } : {}),
        ...(countingIn !== undefined ? { isCountingIn: countingIn } : {}),
        ...(countBeat !== undefined ? { countInBeat: countBeat } : {}),
      })
    }

    if (host.getIsPlaying()) rafId = requestAnimationFrame(() => runUiLoop())
  }

  async function start(options?: {
    skipCountIn?: boolean
    startAt?: number
  }): Promise<void> {
    if (host.getIsPlaying()) return
    await prepare()
    const audio = ensureContext()
    const groove = host.getGroove()
    const beatSeconds = 60 / groove.tempo
    const startAt = options?.startAt ?? audio.currentTime + START_DELAY_SECONDS
    const total = host.getTotalSlots()
    const isResume = resumeSlot !== null && resumeSlot >= 0 && total > 0

    let startIndex = 0
    if (isResume) {
      startIndex = resumeSlot!
      if (startIndex >= total) startIndex = host.getLoop() === 'loop' ? 0 : 0
    }

    // Skip count-in when resuming mid-groove, or when a practice queue advances.
    countInBeatsTotal =
      !isResume && !options?.skipCountIn && host.getCountInEnabled()
        ? Math.max(1, groove.timeSignature.beats)
        : 0
    countInNextBeat = 0
    countInNextTime = startAt
    grooveStartTime = startAt + countInBeatsTotal * beatSeconds
    nextNoteIndex = startIndex
    nextNoteTime = grooveStartTime
    metronomeNextTime = grooveStartTime
    metronomeTickCounter = 0
    lastMetronomeSubdivision = groove.metronomeSubdivision
    if (isResume && groove.metronomeSubdivision > 0) {
      syncMetronomeToSlot(groove, startIndex, grooveStartTime)
    }
    finished = false
    uiEvents = []
    resumeSlot = null

    setAudible(true)
    if (isResume) {
      host.patchPlayhead({
        currentSlot: startIndex,
        isCountingIn: false,
        countInBeat: 0,
      })
    } else {
      host.patchPlayhead({
        currentSlot: -1,
        isCountingIn: countInBeatsTotal > 0,
        countInBeat: 0,
      })
    }
    host.patchPlayback({ isPlaying: true })

    tick()
    timerId = setInterval(() => tick(), LOOKAHEAD_MS)
    runUiLoop()
  }

  function pause(): void {
    if (!host.getIsPlaying()) return

    const countingIn = host.getIsCountingIn()
    const slot = host.getCurrentSlot()
    clearTransportTimers()
    setAudible(false)
    uiEvents = []

    if (countingIn || slot < 0) {
      resumeSlot = null
      host.patchPlayhead({
        currentSlot: -1,
        isCountingIn: false,
        countInBeat: 0,
      })
    } else {
      resumeSlot = slot
      host.patchPlayhead({
        currentSlot: slot,
        isCountingIn: false,
        countInBeat: 0,
      })
    }

    host.patchPlayback({ isPlaying: false })
    host.onStopped()
  }

  function stop(): void {
    const wasPlaying = host.getIsPlaying()
    const hadResume = resumeSlot !== null || host.getCurrentSlot() >= 0
    clearTransportTimers()
    setAudible(false)
    resumeSlot = null
    lastMetronomeSubdivision = null
    host.patchPlayhead({
      currentSlot: -1,
      isCountingIn: false,
      countInBeat: 0,
    })
    uiEvents = []
    if (wasPlaying) {
      host.patchPlayback({ isPlaying: false })
    }
    if (wasPlaying || hadResume) {
      host.onStopped()
    }
  }

  async function toggle(): Promise<void> {
    if (host.getIsPlaying()) pause()
    else await start()
  }

  async function previewSample(sample: string, gain = 0.8): Promise<void> {
    if (!sample) return
    await prepare()
    const audio = ensureContext()
    // Preview uses its own gain path — does not unmute transport or touch playhead/resume.
    playBuffer(sample, gain, audio.currentTime, 1, previewGain)
  }

  /**
   * Jump playhead to `slot`. When paused, updates resume position; when playing,
   * reschedules from that slot without count-in.
   */
  function seek(slot: number): void {
    const total = host.getTotalSlots()
    if (total <= 0) return
    const clamped = Math.max(0, Math.min(Math.floor(slot), total - 1))

    if (!host.getIsPlaying()) {
      resumeSlot = clamped
      host.patchPlayhead({
        currentSlot: clamped,
        isCountingIn: false,
        countInBeat: 0,
      })
      return
    }

    const audio = ensureContext()
    const groove = host.getGroove()
    const startAt = audio.currentTime + START_DELAY_SECONDS

    clearTransportTimers()
    uiEvents = []
    finished = false
    countInBeatsTotal = 0
    countInNextBeat = 0
    countInNextTime = startAt
    grooveStartTime = startAt
    nextNoteIndex = clamped
    nextNoteTime = startAt
    metronomeNextTime = startAt
    metronomeTickCounter = 0
    lastMetronomeSubdivision = groove.metronomeSubdivision

    if (groove.metronomeSubdivision > 0) {
      syncMetronomeToSlot(groove, clamped, startAt)
    }

    resumeSlot = null
    host.patchPlayhead({
      currentSlot: clamped,
      isCountingIn: false,
      countInBeat: 0,
    })

    setAudible(true)
    tick()
    timerId = setInterval(() => tick(), LOOKAHEAD_MS)
    runUiLoop()
  }

  /**
   * Swap to a new groove mid-transport without muting — used when a practice
   * queue item ends and the next should start on the downbeat.
   */
  function chain(options: { startAt: number }): void {
    const groove = host.getGroove()
    const startAt = options.startAt

    clearTransportTimers()
    finished = false
    countInBeatsTotal = 0
    countInNextBeat = 0
    countInNextTime = startAt
    grooveStartTime = startAt
    nextNoteIndex = 0
    nextNoteTime = startAt
    metronomeNextTime = startAt
    metronomeTickCounter = 0
    lastMetronomeSubdivision = groove.metronomeSubdivision
    uiEvents = []
    resumeSlot = null

    host.patchPlayhead({
      currentSlot: -1,
      isCountingIn: false,
      countInBeat: 0,
    })
    host.patchPlayback({ isPlaying: true })

    setAudible(true)
    tick()
    timerId = setInterval(() => tick(), LOOKAHEAD_MS)
    runUiLoop()
  }

  return { start, pause, stop, toggle, previewSample, prepare, seek, chain }
}
