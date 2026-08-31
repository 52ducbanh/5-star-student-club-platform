export const JOURNEY_STAGE_VIEWBOX = {
  width: 1000,
  height: 640,
} as const

export type JourneyNodeCoordinate = {
  x: number
  y: number
  left: string
  top: string
}

export const JOURNEY_COORDINATES: Record<string, JourneyNodeCoordinate> = {
  'dao-duc': {
    x: 200,
    y: 145,
    left: '20%',
    top: '22.66%',
  },
  'hoc-tap': {
    x: 500,
    y: 85,
    left: '50%',
    top: '13.28%',
  },
  'the-luc': {
    x: 800,
    y: 145,
    left: '80%',
    top: '22.66%',
  },
  'tinh-nguyen': {
    x: 740,
    y: 495,
    left: '74%',
    top: '77.34%',
  },
  'hoi-nhap': {
    x: 260,
    y: 495,
    left: '26%',
    top: '77.34%',
  },
} as const

export const JOURNEY_CORE_COORDINATE: JourneyNodeCoordinate = {
  x: 500,
  y: 335,
  left: '50%',
  top: '52.34%',
}
