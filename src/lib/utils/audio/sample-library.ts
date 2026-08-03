// Loads and caches the GPL-licensed drum/metronome samples (see
// static/groove/audio/) as decoded AudioBuffers, ready for the scheduler to
// play through a shared AudioContext.

import { ALL_SAMPLE_NAMES, AUDIO_BASE_PATH } from '../config'

class SampleLibrary {
  private context: AudioContext | null = null
  private buffers = new Map<string, AudioBuffer>()
  private pending = new Map<string, Promise<AudioBuffer>>()

  setContext(context: AudioContext): void {
    this.context = context
  }

  get(name: string): AudioBuffer | undefined {
    return this.buffers.get(name)
  }

  get isFullyLoaded(): boolean {
    return ALL_SAMPLE_NAMES.every((n) => this.buffers.has(n))
  }

  async load(name: string): Promise<AudioBuffer> {
    const cached = this.buffers.get(name)
    if (cached) return cached

    const pending = this.pending.get(name)
    if (pending) return pending

    const promise = this.fetchAndDecode(name)
    this.pending.set(name, promise)
    try {
      const buffer = await promise
      this.buffers.set(name, buffer)
      return buffer
    } finally {
      this.pending.delete(name)
    }
  }

  async preloadAll(
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<void> {
    let loaded = 0
    await Promise.all(
      ALL_SAMPLE_NAMES.map(async (name) => {
        await this.load(name)
        loaded += 1
        onProgress?.(loaded, ALL_SAMPLE_NAMES.length)
      }),
    )
  }

  private async fetchAndDecode(name: string): Promise<AudioBuffer> {
    if (!this.context)
      throw new Error(
        'SampleLibrary: call setContext() before loading samples.',
      )
    const response = await fetch(`${AUDIO_BASE_PATH}/${name}.mp3`)
    if (!response.ok)
      throw new Error(`Failed to fetch sample "${name}": ${response.status}`)
    const arrayBuffer = await response.arrayBuffer()
    return await this.context.decodeAudioData(arrayBuffer)
  }
}

export const sampleLibrary = new SampleLibrary()
