// Manual export/import of a single groove as a `.groove.json` file - the
// replacement for the reference app's shareable URL now that state no longer
// lives in the query string.

import { normalizeGrooveData } from '$lib/utils/snare-modifiers'

const FILE_EXTENSION = '.groove.json'

export function grooveDataToJsonBlob(data: App.Groove.Data): Blob {
  const exportable: App.Groove.Data = { ...data, id: null }
  return new Blob([JSON.stringify(exportable, null, 2)], {
    type: 'application/json',
  })
}

export function downloadGrooveAsJson(data: App.Groove.Data): void {
  const blob = grooveDataToJsonBlob(data)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName =
    (data.name || 'groove').replace(/[^a-z0-9-_ ]/gi, '_').trim() || 'groove'
  a.download = `${safeName}${FILE_EXTENSION}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function parseGrooveJsonFile(
  file: File,
): Promise<App.Groove.Data> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as App.Groove.Data).hiHat) ||
    !(parsed as App.Groove.Data).timeSignature
  ) {
    throw new Error('That file does not look like a Groove Studio export.')
  }
  return normalizeGrooveData({ ...(parsed as App.Groove.Data), id: null })
}
