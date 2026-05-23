import {AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import Utils from "../utils";
import Anime from "animejs";

interface AvatarPart {
  el: SVGGElement;
  multiplierX: number;
  multiplierY: number;
  invert: boolean;
  scaleX: boolean;
  multiplierS: number;
  // Baseline matrix parsed from the initial `transform` attribute.
  baseA: number;
  baseB: number;
  baseC: number;
  baseD: number;
  baseX: number;
  baseY: number;
  // Current animated state — kept in memory so the rAF loop never has to
  // re-read and re-parse the `transform` attribute every frame.
  curA: number;
  curX: number;
  curY: number;
}

@Component({
  standalone: false,
  selector: 'app-avatar-animate',
  templateUrl: './avatar-animate.component.html',
  styleUrls: ['./avatar-animate.component.scss']
})
export class AvatarAnimateComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() width = 0;
  @Input() shutMouth = false;
  @Input() left = 0;
  @Input() top = 0;
  @Input() pauseAnimation = true;
  eyes: any;
  eyesClosed: any;
  leftEyebrow: any;
  rightEyebrow: any;
  faceDetails: any;
  face: any;
  glasses: any;
  nose: any;
  leftEar: any;
  rightEar: any;
  mouth: any;
  mouthClosed: any;
  leftHair: any;
  rightHair: any;
  topHair: any;
  topHairBack: any;
  z1: any;
  z2: any;
  z3: any;
  areClosed: boolean = false;

  private parts: AvatarPart[] = [];
  private rafId = 0;
  private blinkTimeoutId: any = 0;
  private zsRunning = false;
  private destroyed = false;
  private isMobile = false;

  constructor(private zone: NgZone) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.eyes = (document.querySelectorAll('#eyes')[0] as SVGGElement)!;
    this.eyesClosed = (document.querySelectorAll('#eyes-closed')[0] as SVGGElement)!;
    this.leftEyebrow = (document.querySelectorAll('#left-eyebrow')[0] as SVGGElement)!;
    this.rightEyebrow = (document.querySelectorAll('#right-eyebrow')[0] as SVGGElement)!;
    this.faceDetails = (document.querySelectorAll('#face-details')[0] as SVGGElement)!;
    this.face = (document.querySelectorAll('#face')[0] as SVGGElement)!;
    this.glasses = (document.querySelectorAll('#glasses')[0] as SVGGElement)!;
    this.nose = (document.querySelectorAll('#nose')[0] as SVGGElement)!;
    this.leftEar = (document.querySelectorAll('#left-ear')[0] as SVGGElement)!;
    this.rightEar = (document.querySelectorAll('#right-ear')[0] as SVGGElement)!;
    this.mouth = (document.querySelectorAll('#mouth')[0] as SVGGElement)!
    this.mouthClosed = (document.querySelectorAll('#mouth-closed')[0] as SVGGElement)!
    this.leftHair = (document.querySelectorAll('#left-hair')[0] as SVGGElement)!
    this.rightHair = (document.querySelectorAll('#right-hair')[0] as SVGGElement)!
    this.topHair = (document.querySelectorAll('#top-hair')[0] as SVGGElement)!
    this.topHairBack = (document.querySelectorAll('#top-hair-back')[0] as SVGGElement)!
    this.z1 = (document.querySelectorAll('#z1')[0] as SVGGElement)!
    this.z2 = (document.querySelectorAll('#z2')[0] as SVGGElement)!
    this.z3 = (document.querySelectorAll('#z3')[0] as SVGGElement)!
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.blinkTimeoutId) clearTimeout(this.blinkTimeoutId);
  }

  startAnimations() {
    this.zone.runOutsideAngular(() => {
      this.isMobile = Utils.isMobile;
      this.registerPart(this.eyes, 0.08, 0.08, false, false);
      this.registerPart(this.eyesClosed, 0.08, 0.08, false, false);
      this.registerPart(this.leftEyebrow, 0, -0.03, true, false);
      this.registerPart(this.rightEyebrow, 0.05, 0.05, false, false);
      this.registerPart(this.faceDetails, 0.05, 0.05, false, false);
      this.registerPart(this.face, 0.02, 0.05, false, false);
      this.registerPart(this.glasses, 0.06, 0.1, false, false);
      this.registerPart(this.nose, 0.07, 0.11, false, false);
      this.registerPart(this.leftEar, -0.01, -0.05, false, false);
      this.registerPart(this.rightEar, -0.01, -0.05, false, false);
      this.registerPart(this.mouth, 0.06, 0.06, false, false);
      this.registerPart(this.mouthClosed, 0.06, 0.08, false, false);
      this.registerPart(this.topHair, 0.05, 0.01, false, false);
      this.registerPart(this.topHairBack, 0.02, -0.03, false, false);
      this.registerPart(this.leftHair, -0.02, -0.01, false, true, 0.001);
      this.registerPart(this.rightHair, 0.17, -0.01, false, true, -0.001);
      this.startLoop();
      this.blink();
      this.animateZs();
    });
  }

  private registerPart(el: SVGGElement, multiplierX: number, multiplierY: number, invert: boolean, scaleX: boolean, multiplierS: number = 0) {
    if (!el) return;
    const base = this.parseTransform(el);
    this.parts.push({
      el,
      multiplierX,
      multiplierY,
      invert,
      scaleX,
      multiplierS,
      baseA: base.a,
      baseB: base.b,
      baseC: base.c,
      baseD: base.d,
      baseX: base.x,
      baseY: base.y,
      curA: base.a,
      curX: base.x,
      curY: base.y,
    });
  }

  private startLoop() {
    if (this.rafId || this.destroyed) return;
    const tick = () => {
      this.rafId = 0;
      if (this.destroyed) return;
      if (!this.pauseAnimation) {
        this.updateParts();
      }
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  private updateParts() {
    const mobileMultiplier = this.isMobile ? 1.3 : 1;
    const mouseX = (Utils.mouseX - this.left) / Utils.viewWidth * 100;
    const rawMouseY = Utils.mouseY - this.top;
    const mouseY = (rawMouseY > 1000 ? 1000 : rawMouseY) / Utils.viewHeight * 100;

    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      const drivingX = p.invert ? mouseY : mouseX;
      const drivingY = p.invert ? mouseX : mouseY;
      const targetX = p.baseX + drivingX * p.multiplierX * mobileMultiplier;
      const targetY = p.baseY + drivingY * p.multiplierY * mobileMultiplier;
      p.curX += (targetX - p.curX) / 10;
      p.curY += (targetY - p.curY) / 10;
      if (p.scaleX && p.multiplierS) {
        const targetA = p.baseA + mouseX * p.multiplierS;
        p.curA += (targetA - p.curA) / 10;
      }
      p.el.setAttribute(
        'transform',
        'matrix(' + p.curA + ',' + p.baseB + ',' + p.baseC + ',' + p.baseD + ',' + p.curX + ',' + p.curY + ')'
      );
    }
  }

  animateZs() {
    if (this.destroyed || this.zsRunning) return;
    if (!this.pauseAnimation) {
      // Avatar is awake — no Zs while alert. Re-check next frame.
      window.requestAnimationFrame(() => this.animateZs());
      return;
    }
    this.zsRunning = true;
    Anime({
      targets: this.z3,
      keyframes: [
        {opacity: 0, duration: 0},
        {opacity: [1, 0], duration: 1000}
      ],
      delay: 500,
      easing: "linear",
      complete: () => Anime({
        targets: this.z2,
        keyframes: [
          {opacity: 0, duration: 0},
          {opacity: [1, 0], duration: 1000}
        ],
        delay: 500,
        easing: "linear",
        complete: () => Anime({
          targets: this.z1,
          keyframes: [
            {opacity: 0, duration: 0},
            {opacity: [1, 0], duration: 1000}
          ],
          delay: 500,
          easing: "linear",
          complete: () => {
            this.zsRunning = false;
            if (!this.destroyed) this.animateZs();
          }
        })
      })
    });
  }

  blinkNow() {
    this.closeEyes();
    window.setTimeout(() => {
      if (!this.pauseAnimation)
        this.openEyes();
    }, 100)
  }

  closeEyes() {
    window.requestAnimationFrame(() => {
      this.areClosed = true;
      this.eyes.setAttribute('opacity', '0');
      this.eyesClosed.setAttribute('opacity', '1');
    });
  }

  openEyes() {
    window.requestAnimationFrame(() => {
      this.areClosed = false;
      this.eyes.setAttribute('opacity', '1');
      this.eyesClosed.setAttribute('opacity', '0');
    })
  }

  sleep(paused: boolean) {
    if (paused) {
      this.closeEyes()
    } else {
      this.openEyes();
    }
  }

  blink() {
    if (this.destroyed) return;
    this.blinkTimeoutId = window.setTimeout(() => {
      this.blinkTimeoutId = 0;
      if (this.destroyed) return;
      if (!this.pauseAnimation) {
        this.blinkNow();
      }
      this.blink();
    }, Math.random() * 10000);
  }

  getMouseX() {
    return (Utils.mouseX - this.left) / Utils.viewWidth * 100;
  }

  getMouseY() {
    return ((Utils.mouseY - this.top) > 1000 ? 1000 : (Utils.mouseY - this.top)) / Utils.viewHeight * 100;
  }

  private parseTransform(part: SVGGElement) {
    const transform = part.getAttribute('transform');
    if (!transform) return {a: 1, b: 0, c: 0, d: 1, x: 0, y: 0};
    const open = transform.indexOf('(');
    const close = transform.indexOf(')');
    if (open < 0 || close < 0) return {a: 1, b: 0, c: 0, d: 1, x: 0, y: 0};
    const parts = transform.slice(open + 1, close).split(',');
    if (transform[0].toLowerCase() === 'm') {
      return {
        a: Number(parts[0]),
        b: Number(parts[1]),
        c: Number(parts[2]),
        d: Number(parts[3]),
        x: Number(parts[4]),
        y: Number(parts[5]),
      };
    }
    return {a: 1, b: 0, c: 0, d: 1, x: Number(parts[0]), y: Number(parts[1])};
  }

  getTransform(part: any) {
    return this.parseTransform(part);
  }
}
