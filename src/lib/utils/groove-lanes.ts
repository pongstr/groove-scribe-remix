import { LANE_IDS } from './types'

/** Resample a slot array to a new length, nearest-neighbour by position. */
export function resampleArray<T>(source: T[], newLength: number): T[] {
  if (source.length === newLength) return source.slice()
  if (source.length === 0 || newLength === 0)
    return new Array(newLength).fill(null)
  const out: T[] = new Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.floor((i * source.length) / newLength)
    out[i] = source[srcIndex]
  }
  return out
}

const LANE_PROP = {
  hihat: 'hiHat',
  snare: 'snare',
  kick: 'kick',
  sticking: 'sticking',
} as const

const TOM_IDX = { tom1: 0, tom2: 1, tom3: 2, tom4: 3 } as const

export type LaneMap = Record<App.Groove.LaneId, App.Groove.Slot[]> & {
  readonly all: readonly App.Groove.LaneId[]
}

/** Indexed view of a groove's lane arrays — read/write with `lanes(data)[laneId]`. */
export function lanes(data: App.Groove.Data): LaneMap {
  return new Proxy({} as LaneMap, {
    get(_, lane: string | symbol) {
      if (typeof lane !== 'string') return undefined
      if (lane === 'all') return LANE_IDS
      if (lane in TOM_IDX)
        return data.toms[TOM_IDX[lane as keyof typeof TOM_IDX]]
      const prop = LANE_PROP[lane as keyof typeof LANE_PROP]
      return prop ? (data[prop] as App.Groove.Slot[]) : undefined
    },
    set(_, lane: string | symbol, value: App.Groove.Slot[]) {
      if (typeof lane !== 'string' || lane === 'all') return false
      if (lane in TOM_IDX) {
        data.toms[TOM_IDX[lane as keyof typeof TOM_IDX]] =
          value as App.Groove.Data['toms'][number]
        return true
      }
      const prop = LANE_PROP[lane as keyof typeof LANE_PROP]
      if (!prop) return false
      ;(data as unknown as Record<string, App.Groove.Slot[]>)[prop] = value
      return true
    },
  })
}
