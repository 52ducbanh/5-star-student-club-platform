/**
 * First-party lightweight SFX controller for STARPRINT.
 * Uses local HTMLMediaElement audio with preloading, mute controls,
 * debounced playback, autoplay safety, and haptic feedback.
 * NO external APIs or third-party libraries.
 */

export type StarprintSfxId =
  | 'ui_select'
  | 'timer_tick'
  | 'timer_timeout'
  | 'mini_complete'
  | 'solve_correct'
  | 'solve_wrong'
  | 'sense_confirm'
  | 'sprint_lane'
  | 'sprint_jump'
  | 'sprint_land'
  | 'sprint_star'
  | 'sprint_barrier_hit'
  | 'sprint_blocker_hit'
  | 'support_cut'
  | 'support_snap'
  | 'support_success'
  | 'support_reset'
  | 'sync_flip'
  | 'sync_match'
  | 'sync_mismatch'
  | 'starprint_reveal'

const SFX_MANIFEST: Record<StarprintSfxId, { src: string; defaultVolume: number; minIntervalMs: number }> = {
  ui_select: { src: '/audio/ui/select.ogg', defaultVolume: 0.35, minIntervalMs: 60 },
  timer_tick: { src: '/audio/ui/tick.ogg', defaultVolume: 0.25, minIntervalMs: 250 },
  timer_timeout: { src: '/audio/ui/timeout.ogg', defaultVolume: 0.45, minIntervalMs: 500 },
  mini_complete: { src: '/audio/ui/mini-complete.ogg', defaultVolume: 0.6, minIntervalMs: 1000 },

  solve_correct: { src: '/audio/solve/correct.ogg', defaultVolume: 0.55, minIntervalMs: 300 },
  solve_wrong: { src: '/audio/solve/wrong.ogg', defaultVolume: 0.45, minIntervalMs: 300 },

  sense_confirm: { src: '/audio/sense/confirm.ogg', defaultVolume: 0.4, minIntervalMs: 300 },

  sprint_lane: { src: '/audio/sprint/lane-whoosh.flac', defaultVolume: 0.25, minIntervalMs: 80 },
  sprint_jump: { src: '/audio/sprint/jump.flac', defaultVolume: 0.35, minIntervalMs: 150 },
  sprint_land: { src: '/audio/sprint/land.ogg', defaultVolume: 0.25, minIntervalMs: 150 },
  sprint_star: { src: '/audio/sprint/star-pickup.ogg', defaultVolume: 0.6, minIntervalMs: 80 },
  sprint_barrier_hit: { src: '/audio/sprint/barrier-hit.ogg', defaultVolume: 0.5, minIntervalMs: 200 },
  sprint_blocker_hit: { src: '/audio/sprint/blocker-hit.ogg', defaultVolume: 0.6, minIntervalMs: 200 },

  support_cut: { src: '/audio/support/rope-cut.ogg', defaultVolume: 0.45, minIntervalMs: 80 },
  support_snap: { src: '/audio/support/rope-snap.ogg', defaultVolume: 0.4, minIntervalMs: 100 },
  support_success: { src: '/audio/support/target-success.ogg', defaultVolume: 0.6, minIntervalMs: 500 },
  support_reset: { src: '/audio/support/reset.ogg', defaultVolume: 0.35, minIntervalMs: 300 },

  sync_flip: { src: '/audio/sync/card-flip.ogg', defaultVolume: 0.4, minIntervalMs: 60 },
  sync_match: { src: '/audio/sync/pair-match.ogg', defaultVolume: 0.6, minIntervalMs: 200 },
  sync_mismatch: { src: '/audio/sync/mismatch.ogg', defaultVolume: 0.4, minIntervalMs: 200 },

  starprint_reveal: { src: '/audio/starprint/reveal.ogg', defaultVolume: 0.75, minIntervalMs: 1000 },
}

class StarprintSfxController {
  private audioPool = new Map<StarprintSfxId, HTMLAudioElement[]>()
  private lastPlayed = new Map<StarprintSfxId, number>()
  private muted = false
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('starprint_sound_muted')
        this.muted = stored === 'true'
      } catch {
        this.muted = false
      }
    }
  }

  public initOnFirstUserGesture(): void {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    // Preload audio elements in pool
    for (const [id, config] of Object.entries(SFX_MANIFEST) as [StarprintSfxId, (typeof SFX_MANIFEST)[StarprintSfxId]][]) {
      const audio1 = new Audio(config.src)
      audio1.preload = 'auto'
      audio1.volume = config.defaultVolume
      this.audioPool.set(id, [audio1])
    }
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('starprint_sound_muted', muted ? 'true' : 'false')
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  public play(id: StarprintSfxId, volumeScale = 1.0): void {
    if (this.muted || typeof window === 'undefined') return

    const config = SFX_MANIFEST[id]
    if (!config) return

    const now = Date.now()
    const last = this.lastPlayed.get(id) || 0
    if (now - last < config.minIntervalMs) return
    this.lastPlayed.set(id, now)

    try {
      let pool = this.audioPool.get(id)
      if (!pool || pool.length === 0) {
        const fresh = new Audio(config.src)
        fresh.preload = 'auto'
        pool = [fresh]
        this.audioPool.set(id, pool)
      }

      // Find an available element or create a secondary instance
      let audio = pool.find((a) => a.paused || a.ended)
      if (!audio) {
        if (pool.length < 3) {
          audio = new Audio(config.src)
          pool.push(audio)
        } else {
          audio = pool[0]
          audio.pause()
        }
      }

      audio.volume = Math.max(0, Math.min(1, config.defaultVolume * volumeScale))
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or media interrupted - safe silent recovery
        })
      }
    } catch {
      // Ignore media playback exceptions
    }
  }

  public vibrate(pattern: number | number[] = 15): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    if (this.muted) return
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern)
      }
    } catch {
      // Ignore vibration error
    }
  }

  public cleanup(): void {
    for (const pool of this.audioPool.values()) {
      for (const audio of pool) {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch {
          // Ignore pause error
        }
      }
    }
  }
}

export const gameSfx = new StarprintSfxController()
