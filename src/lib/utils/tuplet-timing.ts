import type { TupletGroup, TupletKind } from './types'

/** How many grid columns a tuplet group occupies. */
export const TUPLET_SLOT_COUNT: Record<TupletKind, number> = {
  triplet: 3,
  sixtuplet: 6,
}

/** How many straight grid slots of time the group compresses into. */
export const TUPLET_TIME_SLOTS: Record<TupletKind, number> = {
  triplet: 2,
  sixtuplet: 4,
}

export function tupletSlotCount(kind: TupletKind): number {
  return TUPLET_SLOT_COUNT[kind]
}

export function newTupletId(): string {
  return `tup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

/** Sorted copy; caller should keep groups non-overlapping. */
export function normalizeTupletGroups(groups: TupletGroup[]): TupletGroup[] {
  return [...groups].sort((a, b) => a.startSlot - b.startSlot)
}

export function findTupletGroup(
  groups: TupletGroup[],
  slotIndex: number,
): (TupletGroup & { position: number }) | null {
  for (const group of groups) {
    const span = TUPLET_SLOT_COUNT[group.kind]
    if (slotIndex >= group.startSlot && slotIndex < group.startSlot + span) {
      return { ...group, position: slotIndex - group.startSlot }
    }
  }
  return null
}

function groupAtIndex(
  groups: TupletGroup[],
  index: number,
): TupletGroup | null {
  return findTupletGroup(groups, index)
}

/**
 * Wall-clock offset for a slot index when tuplets compress consecutive cells.
 * Example on a 16th grid: a triplet uses 3 columns but only 2 columns of time.
 */
export function slotAbsoluteMs(
  slotIndex: number,
  slotMs: number,
  groups: TupletGroup[],
): number {
  let time = 0
  let i = 0
  const sorted = normalizeTupletGroups(groups)

  while (i < slotIndex) {
    const active = sorted.find((g) => g.startSlot === i)
    if (active) {
      const span = TUPLET_SLOT_COUNT[active.kind]
      const timeSpan = TUPLET_TIME_SLOTS[active.kind] * slotMs

      if (slotIndex < i + span) {
        const position = slotIndex - i
        return time + (position / span) * timeSpan
      }

      time += timeSpan
      i += span
    } else {
      time += slotMs
      i += 1
    }
  }
  return time
}

export function totalGrooveDurationMs(
  totalSlots: number,
  slotMs: number,
  groups: TupletGroup[],
): number {
  return slotAbsoluteMs(totalSlots, slotMs, groups)
}

/** Drop groups that fall outside the grid or overlap another group. */
export function clampTupletGroups(
  groups: TupletGroup[],
  totalSlots: number,
): TupletGroup[] {
  const sorted = normalizeTupletGroups(groups)
  const kept: TupletGroup[] = []

  for (const group of sorted) {
    const span = TUPLET_SLOT_COUNT[group.kind]
    if (group.startSlot < 0 || group.startSlot + span > totalSlots) continue
    const prev = kept[kept.length - 1]
    if (prev) {
      const prevEnd = prev.startSlot + TUPLET_SLOT_COUNT[prev.kind]
      if (group.startSlot < prevEnd) continue
    }
    kept.push(group)
  }

  return kept
}

export function createTupletGroup(
  startSlot: number,
  kind: TupletKind,
): TupletGroup {
  return { id: newTupletId(), kind, startSlot }
}

export function removeTupletAt(
  groups: TupletGroup[],
  slotIndex: number,
): TupletGroup[] {
  const hit = groupAtIndex(groups, slotIndex)
  if (!hit) return groups
  return groups.filter((g) => g.id !== hit.id)
}

export function upsertTupletAt(
  groups: TupletGroup[],
  startSlot: number,
  kind: TupletKind,
  totalSlots: number,
): TupletGroup[] {
  const span = TUPLET_SLOT_COUNT[kind]
  if (startSlot < 0 || startSlot + span > totalSlots) return groups

  const withoutOverlap = groups.filter((g) => {
    const gSpan = TUPLET_SLOT_COUNT[g.kind]
    const gEnd = g.startSlot + gSpan
    const end = startSlot + span
    return end <= g.startSlot || startSlot >= gEnd
  })

  return clampTupletGroups(
    [...withoutOverlap, createTupletGroup(startSlot, kind)],
    totalSlots,
  )
}
