export interface Particle {
  radius: number,
  p: number,
  q: number,
  posX: number,
  posY: number,
  vX: number,
  vY: number,
  rotation: number,
  torque: number,
  div?: HTMLDivElement,
  resistance: number,
  animationID: number,
  opacity: number,
  deleted: boolean
}
