export function get_top_ABC_BoilerPlate(
  gu: unknown,
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
): string

export function create_ABC_from_snare_HH_kick_arrays(
  gu: unknown,
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
): string

export function createABCFromGrooveData(
  gu: unknown,
  myGrooveData: unknown,
  renderWidth: number,
): string
