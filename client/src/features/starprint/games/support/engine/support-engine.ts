import type { SupportEventV2, SupportPuzzleResultV2 } from '@5ss/contracts'
import type {
  SupportLevelConfig,
  SupportEngineState,
  SupportObjectState,
  CutValidationResult,
} from './support-types'

export class SupportEngine {
  private state: SupportEngineState
  private level: SupportLevelConfig

  constructor(level: SupportLevelConfig, levelIndex = 0, startTimeMs = Date.now()) {
    this.level = level
    this.state = {
      puzzleId: level.puzzleId,
      levelIndex,
      attachedRopes: level.ropes.map((r) => r.ropeId),
      cutRopes: [],
      cutSequence: [],
      objectState: 'HANGING',
      resetCount: 0,
      completed: false,
      timedOut: false,
      events: [],
      startedAtMs: startTimeMs,
    }
  }

  public getState(): Readonly<SupportEngineState> {
    return this.state
  }

  public getLevel(): Readonly<SupportLevelConfig> {
    return this.level
  }

  /**
   * Cuts a rope by ID at a specific timestamp.
   * Returns operation outcome, validation status, and next object state.
   */
  public cutRope(
    ropeId: string,
    atMs: number,
  ): {
    success: boolean
    validation: CutValidationResult
    nextState: SupportObjectState
    eventEmitted: SupportEventV2 | null
  } {
    // Guards: already cut, completed, timed out, or in transient failure/reset
    if (
      this.state.cutRopes.includes(ropeId) ||
      !this.state.attachedRopes.includes(ropeId) ||
      this.state.completed ||
      this.state.timedOut ||
      this.state.objectState === 'RESETTING' ||
      this.state.objectState === 'FAILED'
    ) {
      return {
        success: false,
        validation: { status: 'INVALID' },
        nextState: this.state.objectState,
        eventEmitted: null,
      }
    }

    // 1. Record cut event
    const cutEvent: SupportEventV2 = { type: 'rope-cut', atMs, ropeId }
    this.state.events.push(cutEvent)

    // 2. Update collections
    this.state.cutRopes.push(ropeId)
    this.state.cutSequence.push(ropeId)
    this.state.attachedRopes = this.state.attachedRopes.filter((id) => id !== ropeId)

    // 3. Validate cut sequence
    const validation = this.validateSequence(this.state.cutSequence)

    if (validation.status === 'COMPLETE') {
      this.state.completed = true
      this.state.objectState = 'TARGET'
      const completedEvent: SupportEventV2 = { type: 'completed', atMs }
      this.state.events.push(completedEvent)
      return {
        success: true,
        validation,
        nextState: 'TARGET',
        eventEmitted: cutEvent,
      }
    }

    if (validation.status === 'VALID_PREFIX') {
      const nextState: SupportObjectState =
        this.state.attachedRopes.length === 1
          ? 'SWINGING'
          : this.state.attachedRopes.length === 0
            ? 'FALLING'
            : 'HANGING'
      this.state.objectState = nextState
      return {
        success: true,
        validation,
        nextState,
        eventEmitted: cutEvent,
      }
    }

    // INVALID cut sequence prefix -> FAILED state
    this.state.objectState = 'FAILED'
    const invalidEvent: SupportEventV2 = { type: 'invalid-state', atMs }
    this.state.events.push(invalidEvent)
    return {
      success: true,
      validation,
      nextState: 'FAILED',
      eventEmitted: invalidEvent,
    }
  }

  /**
   * Resets the ropes and state for the current puzzle after an invalid cut.
   * Timer continues without reset.
   */
  public triggerReset(atMs: number): { eventEmitted: SupportEventV2 } {
    this.state.resetCount++
    this.state.cutRopes = []
    this.state.cutSequence = []
    this.state.attachedRopes = this.level.ropes.map((r) => r.ropeId)
    this.state.objectState = 'HANGING'
    const resetEvent: SupportEventV2 = { type: 'auto-reset', atMs }
    this.state.events.push(resetEvent)
    return { eventEmitted: resetEvent }
  }

  public timeout(): void {
    this.state.timedOut = true
  }

  public getPuzzleResult(durationMs: number): SupportPuzzleResultV2 {
    return {
      puzzleId: this.level.puzzleId,
      durationMs: Math.min(durationMs, this.level.timeLimitMs),
      completed: this.state.completed,
      timedOut: this.state.timedOut,
      events: [...this.state.events],
    }
  }

  private validateSequence(cuts: string[]): CutValidationResult {
    for (const seq of this.level.validSequences) {
      if (cuts.length === seq.length && seq.every((c, i) => c === seq[i])) {
        return { status: 'COMPLETE' }
      }
      if (cuts.length < seq.length && cuts.every((c, i) => c === seq[i])) {
        return { status: 'VALID_PREFIX' }
      }
    }
    return { status: 'INVALID' }
  }
}
