// Thin bridge around GrooveScribe's vendored abc2svg + abcNotation pipeline.
// Converts our GrooveData → ABC → SVG HTML string, matching the original app's
// engraved percussion notation (including the optional full notation-key legend).
//
// abc2svg is loaded globally from /groove/vendor/abc2svg-1.js (classic script).

import { browser } from '$app/environment'
import {
  createABCFromGrooveData,
  create_ABC_from_snare_HH_kick_arrays,
  get_top_ABC_BoilerPlate,
} from './vendor/abcNotation.js'
import { calcNotesPerMeasure } from '../music-math.js'
import { grooveDataToAbcArrays } from './tokens.js'
import type { GrooveData } from '../types.js'

export interface AbcRenderResult {
  svg: string
  errorHtml: string
  /** Sparse true/false map of which scaled slots contain a playable note (for playhead). */
  noteMapping: boolean[]
}

interface LegacyGrooveData {
  sticking_array: Array<string | false>
  hh_array: Array<string | false>
  snare_array: Array<string | false>
  kick_array: Array<string | false>
  toms_array: Array<Array<string | false>>
  numberOfMeasures: number
  notesPerMeasure: number
  numBeats: number
  noteValue: number
  timeDivision: number
  title: string
  author: string
  comments: string
  showLegend: boolean
  kickStemsUp: boolean
}

interface AbcInstance {
  tosvg: (name: string, source: string) => void
  out_svg: (s: string) => void
  out_sxsy: (a: number, b: string, c: number) => void
}

type AbcConstructor = new (user: Record<string, unknown>) => AbcInstance

declare global {
  interface Window {
    Abc?: AbcConstructor
  }
}

function getAbcConstructor(): AbcConstructor {
  if (!browser) throw new Error('abc2svg is only available in the browser')
  const Ctor = window.Abc
  if (!Ctor) throw new Error('abc2svg failed to load (window.Abc is missing)')
  return Ctor
}

class AbcBridge {
  grooveUtilsUniqueIndex = 1
  note_mapping_array: boolean[] = []
  abcNoteNumIndex = 0
  abc_obj: AbcInstance | null = null
  myGrooveData: LegacyGrooveData | null = null
  isLegendVisable = false

  get_top_ABC_BoilerPlate = (
    isPermutation: boolean,
    tuneTitle: string,
    tuneAuthor: string,
    tuneComments: string,
    showLegend: boolean,
    isTriplets: boolean,
    kick_stems_up: boolean,
    timeSigTop: number,
    timeSigBottom: number,
    renderWidth: number,
  ) =>
    get_top_ABC_BoilerPlate(
      this,
      isPermutation,
      tuneTitle,
      tuneAuthor,
      tuneComments,
      showLegend,
      isTriplets,
      kick_stems_up,
      timeSigTop,
      timeSigBottom,
      renderWidth,
    )

  create_ABC_from_snare_HH_kick_arrays = (
    sticking_array: Array<string | false>,
    HH_array: Array<string | false>,
    snare_array: Array<string | false>,
    kick_array: Array<string | false>,
    toms_array: Array<Array<string | false>>,
    post_voice_abc: string,
    num_notes: number,
    time_division: number,
    notes_per_measure: number,
    kick_stems_up: boolean,
    timeSigTop: number,
    timeSigBottom: number,
  ) =>
    create_ABC_from_snare_HH_kick_arrays(
      this,
      sticking_array,
      HH_array,
      snare_array,
      kick_array,
      toms_array,
      post_voice_abc,
      num_notes,
      time_division,
      notes_per_measure,
      kick_stems_up,
      timeSigTop,
      timeSigBottom,
    )
}

function toLegacy(data: GrooveData): LegacyGrooveData {
  const arrays = grooveDataToAbcArrays(data)
  const notesPerMeasure = calcNotesPerMeasure(data.division, data.timeSignature)
  return {
    sticking_array: arrays.sticking,
    hh_array: arrays.hh,
    snare_array: arrays.snare,
    kick_array: arrays.kick,
    toms_array: arrays.toms,
    numberOfMeasures: data.measures,
    notesPerMeasure,
    numBeats: data.timeSignature.beats,
    noteValue: data.timeSignature.noteValue,
    timeDivision: data.division,
    title: data.name || '',
    author: data.author || '',
    comments: data.comments || '',
    showLegend: data.showLegend,
    kickStemsUp: data.kickStemsUp,
  }
}

/** TeX-style line packing notices from abc2svg — noisy and not actionable for users. */
function isBenignAbcWarning(msg: string): boolean {
  return /Line underfull|Line overfull|underfull|overfull/i.test(msg)
}

function createCallback(bridge: AbcBridge) {
  const cb = {
    abc_svg_output: '',
    abc_error_output: '',
    page_format: true,
    read_file() {
      return ''
    },
    errmsg(msg: string) {
      if (isBenignAbcWarning(msg)) return
      cb.abc_error_output += msg + '<br/>\n'
    },
    get_abcmodel() { },
    anno_start() { },
    svg_highlight_y: 0,
    svg_highlight_h: 44,
    anno_stop(
      type: string,
      _start: number,
      _stop: number,
      x: number,
      y: number,
      w: number,
      h: number,
    ) {
      if (type === 'bar') {
        cb.svg_highlight_y = y + 5
        cb.svg_highlight_h = h + 10
      }
      if ((type === 'note' || type === 'grace') && bridge.abc_obj) {
        const yy = cb.svg_highlight_y
        const hh = cb.svg_highlight_h
        bridge.abc_obj.out_svg(
          `<rect style="fill: transparent;" class="abcr" id="abcNoteNum_${bridge.grooveUtilsUniqueIndex}_${bridge.abcNoteNumIndex}" x="`,
        )
        bridge.abc_obj.out_sxsy(x, '" y="', yy)
        bridge.abc_obj.out_svg(
          `" width="${w.toFixed(2)}" height="${hh.toFixed(2)}"/>\n`,
        )
        if (type !== 'grace') bridge.abcNoteNumIndex += 1
      }
    },
    img_out(str: string) {
      cb.abc_svg_output += str
    },
  }
  return cb
}

/**
 * Vendor boilerplate does `pagewidth = floor(renderWidth * 0.75)` because
 * "the width of the music is always 25% bigger than what we pass in". Pass the
 * inverse so the engraved system targets `targetWidthPx`.
 */
function pageWidthArgForTarget(targetWidthPx: number): number {
  return Math.max(400, Math.round(targetWidthPx / 0.75))
}

/** Engraving scale for on-screen readability (abc2svg `%%scale`, default 1). */
const STAFF_SCALE = 1.55

/**
 * Tweak generated ABC so systems pack into the visible pane at a larger scale.
 */
function adjustAbcForFit(abcSource: string, targetWidthPx: number): string {
  const pageWidth = Math.max(320, Math.floor(targetWidthPx))
  let out = abcSource.replace(
    /%%pagewidth\s+[\d.]+px/,
    `%%pagewidth ${pageWidth}px`,
  )
  if (/%%scale\s+/.test(out)) {
    out = out.replace(/%%scale\s+[\d.]+/, `%%scale ${STAFF_SCALE}`)
  } else {
    out = out.replace(
      /(%%pagewidth\s+[\d.]+px\n)/,
      `$1%%scale ${STAFF_SCALE}\n`,
    )
  }
  return out
}

export function grooveDataToAbcSource(
  data: GrooveData,
  renderWidth: number,
): string {
  const legacy = toLegacy(data)
  const bridge = new AbcBridge()
  bridge.myGrooveData = legacy
  bridge.isLegendVisable = data.showLegend
  const raw = createABCFromGrooveData(
    bridge,
    legacy,
    pageWidthArgForTarget(renderWidth),
  ) as string
  return adjustAbcForFit(raw, renderWidth)
}

export function renderGrooveToSvg(
  data: GrooveData,
  renderWidth = 720,
): AbcRenderResult {
  if (!browser) {
    return { svg: '', errorHtml: '', noteMapping: [] }
  }

  const legacy = toLegacy(data)
  const bridge = new AbcBridge()
  bridge.myGrooveData = legacy
  bridge.isLegendVisable = data.showLegend

  const abcSource = adjustAbcForFit(
    createABCFromGrooveData(
      bridge,
      legacy,
      pageWidthArgForTarget(renderWidth),
    ) as string,
    renderWidth,
  )
  const noteMapping = (bridge.note_mapping_array ?? []) as boolean[]

  const callback = createCallback(bridge)
  bridge.abcNoteNumIndex = data.showLegend ? -15 : 0
  const AbcCtor = getAbcConstructor()
  const abc = new AbcCtor(callback)
  bridge.abc_obj = abc
  abc.tosvg('SOURCE', abcSource)

  return {
    svg: remapStickingFont(callback.abc_svg_output),
    errorHtml: callback.abc_error_output,
    noteMapping,
  }
}

/**
 * abc2svg's %%xxxfont parser splits on whitespace, so multi-word families are
 * unusable. Stickings use a single-token sentinel (`AbcSticking`); rewrite the
 * emitted SVG CSS to the real JetBrains Mono face.
 */
function remapStickingFont(svg: string): string {
  return svg.replace(
    /\{font:([\d.]+)px AbcSticking\}/g,
    '{font:$1px "JetBrains Mono",monospace}',
  )
}

/** Map a grid slot index onto the abc2svg highlight note index (skips empty scaled slots). */
export function gridSlotToAbcNoteIndex(
  slotIndex: number,
  noteMapping: boolean[],
  notesPerMeasure: number,
  _measures: number,
  timeSigBeats: number,
  timeSigNoteValue: number,
  division: number,
): number {
  const isTriplet = division % 12 === 0
  const fullPerMeasure = isTriplet
    ? 48 * (timeSigBeats / timeSigNoteValue)
    : 32 * (timeSigBeats / timeSigNoteValue)
  const scaler = Math.max(1, Math.ceil(fullPerMeasure / notesPerMeasure))
  const fullIndex = slotIndex * scaler

  let abcIndex = 0
  for (let i = 0; i < noteMapping.length && i <= fullIndex; i++) {
    if (noteMapping[i]) {
      if (i === fullIndex) return abcIndex
      abcIndex += 1
    }
  }
  abcIndex = 0
  for (let i = 0; i < fullIndex && i < noteMapping.length; i++) {
    if (noteMapping[i]) abcIndex += 1
  }
  return abcIndex
}
