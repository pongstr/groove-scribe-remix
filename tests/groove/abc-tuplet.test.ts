import { describe, expect, it } from 'vitest'

import { grooveDataToAbcArrays } from '../../src/lib/utils/abc/tokens'
import {
  create_ABC_from_snare_HH_kick_arrays,
  createABCFromGrooveData,
} from '../../src/lib/utils/abc/vendor/abcNotation.js'
import { calcNotesPerMeasure } from '../../src/lib/utils/music-math'
import { PRESETS } from '../../src/lib/utils/presets'
import { createEmptyGrooveData } from '../../src/lib/utils/tab-notation'
import { upsertTupletAt } from '../../src/lib/utils/tuplet-timing'

function grooveToLegacy(data: ReturnType<typeof createEmptyGrooveData>) {
  const arrays = grooveDataToAbcArrays(data)
  return {
    sticking_array: arrays.sticking,
    hh_array: arrays.hh,
    snare_array: arrays.snare,
    kick_array: arrays.kick,
    toms_array: arrays.toms,
    numberOfMeasures: data.measures,
    notesPerMeasure: calcNotesPerMeasure(data.division, data.timeSignature),
    numBeats: data.timeSignature.beats,
    noteValue: data.timeSignature.noteValue,
    timeDivision: data.division,
    title: data.name || '',
    author: data.author || '',
    comments: data.comments || '',
    showLegend: data.showLegend,
    kickStemsUp: data.kickStemsUp,
    tupletGroups: data.tupletGroups ?? [],
  }
}

function makeBridge() {
  return {
    grooveUtilsUniqueIndex: 1,
    note_mapping_array: [] as boolean[],
    get_top_ABC_BoilerPlate: () => 'X:1\nM:4/4\nL:1/32\nK:C clef=perc\n',
    create_ABC_from_snare_HH_kick_arrays: (
      ...args: Parameters<typeof create_ABC_from_snare_HH_kick_arrays> extends [
        unknown,
        ...infer R,
      ]
        ? R
        : never
    ) => create_ABC_from_snare_HH_kick_arrays(makeBridge(), ...args),
  }
}

describe('abc in-bar tuplets', () => {
  it('emits abc2svg tuplet markers for triplet groups on a straight grid', () => {
    const groove = createEmptyGrooveData()
    groove.hiHat[4] = 'normal'
    groove.hiHat[5] = 'normal'
    groove.hiHat[6] = 'normal'
    groove.tupletGroups = upsertTupletAt([], 4, 'triplet', 16)

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    expect(abc).toContain('(3')
    expect(abc).not.toContain('(3:3:3')
  })

  it('emits abc2svg tuplet markers for sextuplet groups', () => {
    const groove = createEmptyGrooveData()
    groove.snare[0] = 'normal'
    groove.tupletGroups = upsertTupletAt([], 0, 'sixtuplet', 16)

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    expect(abc).toContain('(6:4:6')
    expect(abc).not.toContain('(6:6:6')
  })

  it('emits contiguous tuplet note tokens for beaming', () => {
    const groove = createEmptyGrooveData()
    groove.hiHat[4] = 'normal'
    groove.hiHat[5] = 'normal'
    groove.hiHat[6] = 'normal'
    groove.tupletGroups = upsertTupletAt([], 4, 'triplet', 16)

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/\(3\^g2\^g2\^g2/)
    expect(hands).not.toMatch(/\(3\^g4/)
  })

  it('does not change straight 16th beaming when no tuplets are set', () => {
    const groove = createEmptyGrooveData()
    for (let i = 0; i < 16; i++) groove.hiHat[i] = 'normal'

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    // quads keeps scaler=1 — each 16th is ^g2, not ^g4 quarter notes
    expect(hands).toMatch(/\^g2/)
    expect(hands).not.toMatch(/\^g4\^g4/)
  })

  it('applies tuplet marker to every voice so bar duration stays aligned', () => {
    const groove = createEmptyGrooveData()
    groove.showStickings = true
    groove.sticking[4] = 'count'
    groove.sticking[5] = 'count'
    groove.sticking[6] = 'count'
    groove.hiHat[4] = 'normal'
    groove.hiHat[5] = 'normal'
    groove.hiHat[6] = 'normal'
    groove.kickStemsUp = false
    groove.tupletGroups = upsertTupletAt([], 4, 'triplet', 16)

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const stickings = abc.split('V:Stickings')[1]?.split('V:')[0] ?? ''
    const hands = abc.split('V:Hands')[1]?.split('V:')[0] ?? ''
    const feet = abc.split('V:Feet')[1]?.split('V:')[0] ?? ''
    expect(stickings).toContain('(3')
    expect(hands).toContain('(3')
    expect(feet).toContain('(3')
  })

  it('keeps eighth-note triplet cells as ^g4 not ^g8 on an 8th grid', () => {
    const groove = createEmptyGrooveData()
    groove.division = 8
    groove.hiHat = Array(8).fill(null)
    groove.snare = Array(8).fill(null)
    groove.kick = Array(8).fill(null)
    groove.sticking = Array(8).fill(null)
    groove.toms = groove.toms.map(() => Array(8).fill(null))
    groove.hiHat[2] = 'normal'
    groove.hiHat[3] = 'normal'
    groove.hiHat[4] = 'normal'
    groove.tupletGroups = upsertTupletAt([], 2, 'triplet', 8)

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/\(3\^g4\^g4\^g4/)
    expect(hands).not.toMatch(/\(3\^g8/)
  })
})

describe('abc snare rolls and ties', () => {
  it('engraves a 2-slash roll with stacked accent and a tie', () => {
    const groove = createEmptyGrooveData()
    groove.snare[8] = 'buzz2'
    groove.snare[10] = 'buzz2'
    groove.snareAccent = groove.snare.map(() => false)
    groove.snareTies = groove.snare.map(() => false)
    groove.snareAccent[8] = true
    groove.snareTies[8] = true

    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/!accent!/)
    expect(hands).toMatch(/!\/\/!c/)
    expect(hands).toMatch(/-/)
    expect(hands).not.toMatch(/!\/\/\/!/)
  })

  it('engraves the tied 2-slash roll example', () => {
    const preset = PRESETS.find((p) => p.name === 'Tied 2-Slash Rolls')
    expect(preset).toBeDefined()
    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(preset!.data),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/!\/\/!c/)
    expect(hands).toMatch(/-/)
    expect(hands).toMatch(/!accent!/)
    expect(hands).toMatch(/\{\/c\}/)
  })

  it('engraves a 1-slash roll', () => {
    const groove = createEmptyGrooveData()
    groove.snare[0] = 'buzz'
    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/!\/!c/)
    expect(hands).not.toMatch(/!\/\/!/)
    expect(hands).not.toMatch(/!\/\/\/!/)
  })

  it('still engraves a 3-slash buzz', () => {
    const groove = createEmptyGrooveData()
    groove.snare[0] = 'buzz3'
    const abc = createABCFromGrooveData(
      makeBridge(),
      grooveToLegacy(groove),
      720,
    )
    const hands = abc.split('V:Hands')[1] ?? ''
    expect(hands).toMatch(/!\/\/\/!c/)
  })
})
