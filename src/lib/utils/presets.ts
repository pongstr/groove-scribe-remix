// Built-in preset groove library. The tab strings below are transcribed from
// the reference GrooveScribe app's `js/grooves.js` (GPL v2, data only - the
// parsing code is our own `tabNotation.ts`), organized the same way: Rock,
// Triplet, World, and Foot Ostinato categories.

import { parseGrooveTabString } from './tab-notation'
import type { PresetGroove } from './types'

const RAW_PRESETS: { category: string; name: string; tab: string }[] = [
  // Rock grooves
  {
    category: 'Rock Grooves',
    name: 'Empty 16th Note Groove',
    tab: 'TimeSig=4/4&Div=16&Tempo=80&Measures=1&H=|----------------|&S=|----------------|&K=|----------------|',
  },
  {
    category: 'Rock Grooves',
    name: '8th Note Rock',
    tab: 'TimeSig=4/4&Div=8&Tempo=80&Measures=1&H=|xxxxxxxx|&S=|--O---O-|&K=|o---o--|',
  },
  {
    category: 'Rock Grooves',
    name: '16th Note Rock',
    tab: 'TimeSig=4/4&Div=16&Tempo=80&Measures=1&H=|xxxxxxxxxxxxxxxx|&S=|----O-------O---|&K=|o-------o-------|',
  },
  {
    category: 'Rock Grooves',
    name: 'Syncopated Hi-Hats #1',
    tab: 'TimeSig=4/4&Div=16&Title=Syncopated%20hi-hats%201&Tempo=80&Measures=1&H=|x-xxx-xxx-xxx-xx|&S=|----O-------O---|&K=|o-------o-------|',
  },
  {
    category: 'Rock Grooves',
    name: 'Syncopated Hi-Hats #2',
    tab: 'TimeSig=4/4&Div=16&Title=Syncopated%20hi-hats%202&Tempo=80&Measures=1&H=|xxx-xxx-xxx-xxx-|&S=|----O-------O---|&K=|o-------o-------|',
  },
  {
    category: 'Rock Grooves',
    name: 'Train Beat',
    tab: 'TimeSig=4/4&Div=16&Swing=0&Title=Train%20Beat&Tempo=95&Measures=1&H=|----------------|&S=|ggOgggOgggOggOOg|&K=|o-x-o-x-o-x-o-x-|',
  },
  // Triplet grooves
  {
    category: 'Triplet Grooves',
    name: 'Jazz Shuffle',
    tab: 'TimeSig=4/4&Div=12&Title=Jazz%20Shuffle&Tempo=100&Measures=1&H=|r--r-rr--r-r|&S=|g-gO-gg-gO-g|&K=|o--X--o--X--|',
  },
  {
    category: 'Triplet Grooves',
    name: 'Half Time Shuffle in 8th Notes',
    tab: 'TimeSig=4/4&Div=12&Title=Half%20Time%20Shuffle&Swing=0&Measures=1&H=|x-xx-xx-xx-x|&S=|-g--g-Og--g-|&K=|------------|',
  },
  {
    category: 'Triplet Grooves',
    name: 'Half Time Shuffle in 16th Notes',
    tab: 'TimeSig=4/4&Div=24&Swing=0&Tempo=85&Measures=1&H=|x-xx-xx-xx-xx-xx-xx-xx-x|&S=|-g--g-Og--g--g--g-Og--g-|&K=|------------------------|',
  },
  {
    category: 'Triplet Grooves',
    name: 'Purdie Shuffle',
    tab: 'TimeSig=4/4&Div=12&Swing=0&Tempo=120&Title=Purdie%20Shuffle&Measures=1&H=|x-xx-xx-xx-x|&S=|-g--g-Og--g-|&K=|o----o-----o|',
  },
  {
    category: 'Triplet Grooves',
    name: 'Jazz Ride',
    tab: 'TimeSig=4/4&Div=12&Tempo=80&Measures=1&H=|r--r-rr--r-r|&S=|------------|&K=|---x-----x--|',
  },
  // World grooves
  {
    category: 'World Grooves',
    name: 'Bossa Nova',
    tab: 'TimeSig=4/4&Div=8&Title=Bossa%20Nova&Tempo=140&Measures=2&H=|xxxxxxxx|xxxxxxxx|&S=|x-x--x-x|-x--x-x-|&K=|o-xoo-xo|o-xoo-xo|',
  },
  {
    category: 'World Grooves',
    name: 'Jazz Samba',
    tab: 'TimeSig=4/4&Div=16&Title=Samba&Tempo=80&Measures=1&H=|r-rrr-rrr-rrr-rr|&S=|o-o--o-o-o-oo-o-|&K=|o-xoo-xoo-xoo-xo|',
  },
  {
    category: 'World Grooves',
    name: 'Songo',
    tab: 'TimeSig=4/4&Div=16&Title=Songo&Tempo=80&Measures=1&H=|x---x---x---x---|&S=|--O--g-O-gg--g-g|&K=|---o--o----o--o-|',
  },
  // Foot ostinatos
  {
    category: 'Foot Ostinatos',
    name: 'Samba Ostinato',
    tab: 'TimeSig=4/4&Div=16&Title=Samba%20Ostinato&Tempo=60&Swing=0&Measures=1&H=|----------------|&S=|----------------|&K=|o-xoo-xoo-xoo-xo|',
  },
  {
    category: 'Foot Ostinatos',
    name: 'Tumbao Ostinato',
    tab: 'TimeSig=4/4&Div=16&Title=Tumbao%20Ostinato&Tempo=60&Measures=1&H=|----------------|&S=|----------------|&K=|x--ox-o-x--ox-o-|',
  },
  {
    category: 'Foot Ostinatos',
    name: 'Baiao Ostinato',
    tab: 'TimeSig=4/4&Div=16&Title=Baiao%20Ostinato&Tempo=60&Measures=1&H=|----------------|&S=|----------------|&K=|o-xo--X-o-xo--X-|',
  },
]

export const PRESETS: PresetGroove[] = RAW_PRESETS.map((p, i) => {
  const data = parseGrooveTabString(p.tab)
  data.name = p.name
  return {
    id: `preset-${i}`,
    category: p.category,
    name: p.name,
    data,
  }
})

export const PRESET_CATEGORIES: string[] = [
  ...new Set(PRESETS.map((p) => p.category)),
]

export function presetsByCategory(category: string): PresetGroove[] {
  return PRESETS.filter((p) => p.category === category)
}
