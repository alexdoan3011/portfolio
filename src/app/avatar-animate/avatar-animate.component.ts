import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import Utils from "../utils";
import Anime from "animejs";

@Component({
  selector: 'app-avatar-animate',
  templateUrl: './avatar-animate.component.html',
  styleUrls: ['./avatar-animate.component.scss']
})
export class AvatarAnimateComponent implements OnInit, AfterViewInit {

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

  constructor() {
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


  startAnimations() {
    this.animatePart(this.eyes, 0.08, 0.08, false, false);
    this.animatePart(this.eyesClosed, 0.08, 0.08, false, false);
    this.animatePart(this.leftEyebrow, 0, -0.03, true, false);
    this.animatePart(this.rightEyebrow, 0.05, 0.05, false, false);
    this.animatePart(this.faceDetails, 0.05, 0.05, false, false);
    this.animatePart(this.face, 0.02, 0.05, false, false);
    this.animatePart(this.glasses, 0.06, 0.1, false, false);
    this.animatePart(this.nose, 0.07, 0.11, false, false);
    this.animatePart(this.leftEar, -0.01, -0.05, false, false);
    this.animatePart(this.rightEar, -0.01, -0.05, false, false);
    this.animatePart(this.mouth, 0.06, 0.06, false, false);
    this.animatePart(this.mouthClosed, 0.06, 0.08, false, false);
    this.animatePart(this.topHair, 0.05, 0.01, false, false);
    this.animatePart(this.topHairBack, 0.02, -0.03, false, false);
    this.animatePart(this.leftHair, -0.02, -0.01, false, true, 0.001);
    this.animatePart(this.rightHair, 0.17, -0.01, false, true, -0.001);
    this.blink();
    this.animateZs();
  }

  animateZs() {
    if (!this.pauseAnimation) {
      window.requestAnimationFrame(() => this.animateZs());
      return;
    }
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
          complete: () => this.animateZs()
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
    window.setTimeout(() => {
      if (!this.pauseAnimation) {
        this.blinkNow();
      }
      this.blink();
    }, Math.random() * 10000);
  }

  animatePart(part: any, multiplierX: number, multiplierY: number, invert: boolean, scaleX: boolean, multiplierS?: number, originalTransform?: any, newTransform?: any) {
    window.requestAnimationFrame(() => {
      if (!this.pauseAnimation) {
        if (!originalTransform) {
          originalTransform = this.getTransform(part);
        }
        newTransform = this.getTransform(part);
        const mobileMultiplier = Utils.isMobile ? 1.3 : 1;
        if (invert) {
          newTransform.x += (originalTransform.x + this.getMouseY() * multiplierX * mobileMultiplier - newTransform.x) / 10;
          newTransform.y += (originalTransform.y + this.getMouseX() * multiplierY * mobileMultiplier - newTransform.y) / 10;
        } else {
          newTransform.x += (originalTransform.x + this.getMouseX() * multiplierX * mobileMultiplier - newTransform.x) / 10;
          newTransform.y += (originalTransform.y + this.getMouseY() * multiplierY * mobileMultiplier - newTransform.y) / 10;
        }
        if (scaleX && multiplierS) {
          newTransform.a += (originalTransform.a + this.getMouseX() * multiplierS - newTransform.a) / 10;
        }
        part.setAttribute('transform', 'matrix(' + newTransform.a + ',' + newTransform.b + ',' + newTransform.c + ',' + newTransform.d + ',' + newTransform.x + ',' + newTransform.y + ')');
      }
      this.animatePart(part, multiplierX, multiplierY, invert, scaleX, multiplierS, originalTransform, newTransform);
    })
  }

  getMouseX() {
    return (Utils.mouseX - this.left) / Utils.viewWidth * 100;
  }

  getMouseY() {
    return ((Utils.mouseY - this.top) > 1000 ? 1000 : (Utils.mouseY - this.top)) / Utils.viewHeight * 100;
  }

  getTransform(part: any) {
    const transform = part.getAttribute('transform');
    if (!transform) return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      x: 0,
      y: 0
    }
    if (transform[0].toLowerCase() === 'm') {
      return {
        a: Number(transform.split(',')[0].split('(')[1]),
        b: Number(transform.split(',')[1]),
        c: Number(transform.split(',')[2]),
        d: Number(transform.split(',')[3]),
        x: Number(transform.split(',')[4]),
        y: Number(transform.split(',')[5].slice(0, -1))
      };
    }
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      x: Number(transform.split(',')[0].split('(')[1]),
      y: Number(transform.split(',')[1].slice(0, -1))
    };
  }
}
