// Minimal Standard MIDI File (format 0) writer. Rather than porting the
// reference app's vendored `jsmidgen` dependency, this is a small
// from-scratch implementation of just what a drum groove needs: a tempo meta
// event plus note on/off pairs on the GM percussion channel (10). Small
// enough to audit at a glance, and avoids pulling in an unmaintained
// third-party dependency for ~80 lines of byte-twiddling.

import {
  HIHAT_ARTICULATIONS,
  KICK_ARTICULATIONS,
  SNARE_ARTICULATIONS,
} from '../config'
import { calcNotesPerMeasure, isUpbeatSlot } from '../music-math'
import type { GrooveData } from '../types'

const PERCUSSION_CHANNEL = 9 // MIDI channel 10, 0-indexed
const TICKS_PER_QUARTER = 480

// General MIDI percussion key map (partial - just what we can play).
const GM_NOTE = {
  hihat: {
    normal: 42, // Closed Hi-Hat
    accent: 42,
    open: 46, // Open Hi-Hat
    closed: 44, // Pedal Hi-Hat
    ride: 51, // Ride Cymbal 1
    rideBell: 53, // Ride Bell
    crash: 49, // Crash Cymbal 1
    stacker: 55, // Splash Cymbal
    cowbell: 56, // Cowbell
  },
  snare: {
    normal: 38, // Acoustic Snare
    accent: 38,
    ghost: 38,
    xstick: 37, // Side Stick
    buzz: 40, // Electric Snare (closest GM equivalent)
    flam: 38,
    drag: 38,
  },
  kickNormal: 36, // Bass Drum 1
  kickSplash: 44, // Pedal Hi-Hat (foot splash)
  toms: [50, 48, 47, 41], // High Tom, Hi-Mid Tom, Low-Mid Tom, Low Floor Tom
} as const

function velocityFromGain(gain: number): number {
  return Math.min(127, Math.max(1, Math.round(gain * 127)))
}

interface NoteEvent {
  tick: number
  type: 'on' | 'off'
  note: number
  velocity: number
}

function encodeVarLen(value: number): number[] {
  let buffer = value & 0x7f
  while ((value >>= 7) > 0) {
    buffer <<= 8
    buffer |= (value & 0x7f) | 0x80
  }
  const out: number[] = []
  for (;;) {
    out.push(buffer & 0xff)
    if (buffer & 0x80) buffer >>>= 8
    else break
  }
  return out
}

function uint32be(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
}

export function grooveDataToMidiBytes(data: GrooveData): Uint8Array {
  const notesPerMeasure = calcNotesPerMeasure(data.division, data.timeSignature)
  const totalSlots = notesPerMeasure * data.measures
  const slotTicks = (TICKS_PER_QUARTER * 4) / data.division
  const noteOffTicks = Math.max(8, Math.round(slotTicks * 0.4))

  const events: NoteEvent[] = []

  function addHit(index: number, note: number, velocity: number) {
    const swingTicks = isUpbeatSlot(data.division, index)
      ? slotTicks * (data.swingPercent / 100) * (1 / 3)
      : 0
    const tick = Math.round(index * slotTicks + swingTicks)
    events.push({ tick, type: 'on', note, velocity })
    events.push({ tick: tick + noteOffTicks, type: 'off', note, velocity: 0 })
  }

  for (let i = 0; i < totalSlots; i++) {
    const hh = data.hiHat[i]
    if (hh)
      addHit(
        i,
        GM_NOTE.hihat[hh],
        velocityFromGain(HIHAT_ARTICULATIONS[hh].gain),
      )

    const sn = data.snare[i]
    if (sn)
      addHit(
        i,
        GM_NOTE.snare[sn],
        velocityFromGain(SNARE_ARTICULATIONS[sn].gain),
      )

    const ki = data.kick[i]
    if (ki === 'normal')
      addHit(
        i,
        GM_NOTE.kickNormal,
        velocityFromGain(KICK_ARTICULATIONS.normal.gain),
      )
    else if (ki === 'splash')
      addHit(
        i,
        GM_NOTE.kickSplash,
        velocityFromGain(KICK_ARTICULATIONS.splash.gain),
      )
    else if (ki === 'kickAndSplash') {
      addHit(
        i,
        GM_NOTE.kickNormal,
        velocityFromGain(KICK_ARTICULATIONS.kickAndSplash.gain),
      )
      addHit(
        i,
        GM_NOTE.kickSplash,
        velocityFromGain(KICK_ARTICULATIONS.kickAndSplash.gain),
      )
    }

    if (data.showToms) {
      data.toms.forEach((tom, tomIndex) => {
        if (tom[i]) addHit(i, GM_NOTE.toms[tomIndex], 100)
      })
    }
  }

  events.sort((a, b) => a.tick - b.tick || (a.type === 'off' ? -1 : 1))

  const track: number[] = []
  const microsPerQuarter = Math.round(60000000 / data.tempo)
  track.push(
    ...encodeVarLen(0),
    0xff,
    0x51,
    0x03,
    (microsPerQuarter >> 16) & 0xff,
    (microsPerQuarter >> 8) & 0xff,
    microsPerQuarter & 0xff,
  )
  track.push(
    ...encodeVarLen(0),
    0xff,
    0x58,
    0x04,
    data.timeSignature.beats,
    Math.log2(data.timeSignature.noteValue),
    24,
    8,
  )

  let lastTick = 0
  for (const event of events) {
    track.push(...encodeVarLen(Math.max(0, event.tick - lastTick)))
    if (event.type === 'on')
      track.push(0x90 | PERCUSSION_CHANNEL, event.note, event.velocity)
    else track.push(0x80 | PERCUSSION_CHANNEL, event.note, 0)
    lastTick = event.tick
  }
  track.push(...encodeVarLen(0), 0xff, 0x2f, 0x00)

  const header = [
    0x4d,
    0x54,
    0x68,
    0x64,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    (TICKS_PER_QUARTER >> 8) & 0xff,
    TICKS_PER_QUARTER & 0xff,
  ]
  const trackHeader = [0x4d, 0x54, 0x72, 0x6b, ...uint32be(track.length)]

  return new Uint8Array([...header, ...trackHeader, ...track])
}

export function downloadGrooveAsMidi(data: GrooveData): void {
  const bytes = grooveDataToMidiBytes(data)
  const blob = new Blob([bytes], { type: 'audio/midi' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName =
    (data.name || 'groove').replace(/[^a-z0-9-_ ]/gi, '_').trim() || 'groove'
  a.download = `${safeName}.mid`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
