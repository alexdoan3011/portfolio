export type ShapeKind = 'polygon' | 'star' | 'heart' | 'streamer' | 'circle';

export interface Particle {
  radius: number,
  p: number,
  q: number,
  shapeKind?: ShapeKind,
  innerRatio?: number, // star: inner/outer radius ratio
  aspect?: number,     // streamer: half-height / radius
  posX: number,
  posY: number,
  vX: number,
  vY: number,
  rotation: number,
  torque: number,
  div?: HTMLDivElement,
  svgEl?: SVGSVGElement,
  hue?: number,
  lightness?: number,
  resistance: number,
  opacity: number,
  deleted: boolean,
  recolor: boolean,
  respawn?: boolean,
  tiltCos: number,
  tiltSin: number,
  tumbleAngle: number,
  tumbleRate: number,
  glowTimer: number,
  glowing: boolean,
  glowToggle: boolean,
  glowDuration: number,
  launchDelay?: number
}
