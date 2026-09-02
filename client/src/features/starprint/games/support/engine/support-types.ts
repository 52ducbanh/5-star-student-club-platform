import type { SupportEventV2 } from '@5ss/contracts'

export type SupportObjectState =
  | 'HANGING'
  | 'SWINGING'
  | 'FALLING'
  | 'TARGET'
  | 'FAILED'
  | 'RESETTING'

export interface Point2D {
  x: number
  y: number
}

export interface SupportRopeConfig {
  ropeId: string
  label: string
  // Anchor fixed position in SVG 0..100 space
  x1: number
  y1: number
  // Object attachment resting point in SVG 0..100 space
  x2: number
  y2: number
}

export interface SupportLevelConfig {
  puzzleId: string
  title: string
  instruction: string
  objectPos: Point2D
  targetPos: Point2D
  ropes: SupportRopeConfig[]
  validSequences: string[][]
  optimalCutCount: number
  timeLimitMs: number
}

export interface SupportEngineState {
  puzzleId: string
  levelIndex: number
  attachedRopes: string[]
  cutRopes: string[]
  cutSequence: string[]
  objectState: SupportObjectState
  resetCount: number
  completed: boolean
  timedOut: boolean
  events: SupportEventV2[]
  startedAtMs: number
}

export type CutValidationStatus = 'COMPLETE' | 'VALID_PREFIX' | 'INVALID'

export interface CutValidationResult {
  status: CutValidationStatus
}
