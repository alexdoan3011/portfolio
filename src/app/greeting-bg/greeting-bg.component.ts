import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import Anime from "animejs";
import Utils from "../utils"
import {ConfettiComponent} from "../confetti/confetti.component";

@Component({
  selector: 'app-greeting-bg',
  templateUrl: './greeting-bg.component.html',
  styleUrls: ['./greeting-bg.component.scss']
})
export class GreetingBgComponent {
  @Output() cleanedUp: EventEmitter<any> = new EventEmitter();
  @ViewChild(ConfettiComponent) confetti!: ConfettiComponent;
  @ViewChild('sun') sun!: ElementRef;
  @ViewChild('sunRay') sunray!: ElementRef;
  @ViewChild('cloud1') cloud1!: ElementRef;
  @ViewChild('cloud2') cloud2!: ElementRef;
  @ViewChild('cloud3') cloud3!: ElementRef;
  @ViewChild('rainbowAnimator') rainbowAnimator!: ElementRef;
  @ViewChild('rainbow') rainbow!: ElementRef;
  @ViewChild('popperLeft') popperLeft!: ElementRef;
  @ViewChild('popperRight') popperRight!: ElementRef;
  @ViewChild('trumpetLeft') trumpetLeft!: ElementRef;
  @ViewChild('trumpetRight') trumpetRight!: ElementRef;
  @ViewChild('vfxLeft') vfxLeft!: ElementRef;
  @ViewChild('vfxRight') vfxRight!: ElementRef;
  @ViewChild('bg') background!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  smokeLeft: HTMLElement[] = [];
  smokeRight: HTMLElement[] = [];
  stopAnimating = false;
  animated: HTMLElement[] = [];
  sweep = false;
  cleanUpTime = 1000;
  private confettiPopped = false;

  constructor() {
  }

  stopAnimations() {
    this.stopAnimating = true;
  }

  cleanUp() {
    if (this.sweep) return;
    this.sweep = true;
    this.confetti.cleanUp();
    Anime.remove(this.animated);
    this.vfxRight.nativeElement.style.opacity = 0;
    this.vfxLeft.nativeElement.style.opacity = 0;
    const left = [this.trumpetLeft.nativeElement, this.popperLeft.nativeElement];
    left.forEach(x => x.style.transformOrigin = 'left bottom');
    const right = [this.trumpetRight.nativeElement, this.popperRight.nativeElement];
    right.forEach(x => x.style.transformOrigin = 'right bottom');
    Anime({
      targets: left,
      rotate: 45,
      translateY: '-50%',
      duration: this.cleanUpTime,
    })
    Anime({
      targets: right,
      rotate: -45,
      translateY: '-50%',
      duration: this.cleanUpTime,
    })
    Anime({
      targets: this.rainbow.nativeElement,
      opacity: 0,
      duration: this.cleanUpTime,
    })
    Anime({
      targets: [this.cloud1.nativeElement, this.cloud2.nativeElement, this.sun.nativeElement],
      translateX: '100%',
      easing: 'easeInSine',
      duration: this.cleanUpTime,
    })
    Anime({
      targets: this.cloud3.nativeElement,
      translateX: '+=' + Utils.viewWidth,
      opacity: 0,
      easing: 'easeInSine',
      duration: this.cleanUpTime,
    })
    Anime({
      targets: this.sunray.nativeElement,
      scale: [1, 0],
      easing: 'linear',
      duration: this.cleanUpTime / 2,
    })
    Anime({
      targets: [this.smokeLeft, this.smokeRight],
      opacity: 0,
      easing: 'linear',
      duration: this.cleanUpTime
    })
    Anime({
      targets: this.background.nativeElement,
      translateY: '-=' + Utils.viewHeight,
      easing: 'easeOutSine',
      duration: this.cleanUpTime / 2,
    })
  }

  startAnimations() {
    this.animatePopper(true);
    this.animatePopper();
    this.animateTrumpet(true);
    this.animateTrumpet()
    this.animateBackground();
    this.animateSun();
    this.animateCloud(this.cloud1.nativeElement);
    this.animateCloud(this.cloud2.nativeElement);
    this.animateCloud(this.cloud3.nativeElement);
    this.animateRainbow();
  }

  animateSun() {
    if (this.stopAnimating) return;
    this.animated.push(this.sunray.nativeElement);
    Anime({
      targets: this.sunray.nativeElement,
      scale: [0, 1],
      easing: 'easeOutSine',
      delay: 1000,
      duration: 7000
    })
    this.animated.push(this.sun.nativeElement);
    Anime({
      targets: this.sun.nativeElement,
      translateX: '-110%',
      opacity: 1,
      easing: 'easeOutSine',
      duration: 1000,
      delay: 500,
      complete: () => {
        if (this.stopAnimating) return;
        this.idleAnimation(this.sun.nativeElement, 3000);
      }
    });
  }

  animateRainbow() {
    if (this.stopAnimating) return;
    this.animated.push(this.rainbowAnimator.nativeElement);
    Anime({
      targets: this.rainbowAnimator.nativeElement,
      translateX: ['-50%', '-50%'],
      rotate: [-180, 0],
      duration: 1500,
      easing: 'linear',
    });
    const toAnimate = this.rainbowAnimator.nativeElement.getElementsByTagName('img');
    this.animated.push(toAnimate);
    Anime({
      targets: toAnimate,
      rotate: [180, 0],
      duration: 1500,
      easing: 'linear',
    });
  }

  async createSmoke(toAnimate: HTMLElement, left?: boolean) {
    if (this.stopAnimating) return;
    const img = document.createElement('img');
    img.src = 'assets/svg/smoke.svg';
    img.style.position = 'absolute';
    img.style.transform = 'scale(1)'
    img.width = Utils.viewWidth / 20;
    img.style.bottom = '10%';
    img.style.zIndex = '-50'
    this.wrapper.nativeElement.appendChild(img);
    if (left) {
      img.style.left = '5%';
      this.smokeLeft.push(img);
    } else {
      img.style.right = '5%';
      this.smokeRight.push(img);
    }
  }

  animateSmoke(left?: boolean) {
    if (this.stopAnimating) return;
    (left ? this.smokeLeft : this.smokeRight).forEach(x => {
      Anime({
        targets: x,
        translateX: (left ? 1 : -1) * Utils.random30Percent(100) + '%',
        translateY: Utils.random30Percent(-150) + '%',
        rotate: (Math.random() < 0.5 ? 1 : -1) * Math.random() * 360,
        scale: 3,
        duration: 3000,
        opacity: 0,
        easing: "easeOutCirc"
      });
      this.animated.push(x);
    });
  }

  animateBackground() {
    this.animated.push(this.background.nativeElement.childNodes);
    Anime({
      targets: this.background.nativeElement.childNodes,
      opacity: 1,
      duration: 5000
    })
  }

  animateCloud(toAnimate: HTMLElement) {
    if (this.stopAnimating) return;
    this.animated.push(toAnimate);
    Anime({
      targets: toAnimate,
      translateX: (toAnimate.getBoundingClientRect().left <= 0 ? 1.5 : -1) * 150 + '%',
      duration: 1000,
      easing: 'easeInOutSine',
      complete: () => {
        this.idleAnimation(toAnimate, 3000);
      }
    });
  }

  idleAnimation(target: HTMLElement | HTMLElement[], duration?: number) {
    if (this.stopAnimating) return;
    Anime({
      targets: [target],
      translateX: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random30Percent(10),
      translateY: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random30Percent(10),
      direction: 'alternate',
      duration: duration ? duration : 600,
      easing: 'easeInOutSine',
      complete: () => {
        if (this.stopAnimating) return;
        if (duration) {
          this.idleAnimation(target, duration);
        } else {
          this.idleAnimation(target);
        }
      }
    });
  }


  animatePopper(left?: boolean) {
    const toAnimate = left ? this.popperLeft.nativeElement : this.popperRight.nativeElement;
    if (this.stopAnimating) return;
    this.animated.push(toAnimate);
    Anime({
      targets: toAnimate,
      translateX: (left ? 1 : -1) * 120 + '%',
      translateY: '-120%',
      duration: 1000,
      complete: () => {
        if (this.stopAnimating) return;
        if (!this.confettiPopped) {
          this.confettiPopped = true;
          this.confetti.popConfetti();
        }
        Anime({
          targets: toAnimate,
          translateX: (left ? 1 : -1) * 100 + '%',
          translateY: '-100%',
          duration: 300,
          easing: 'easeOutBack',
          complete: () => this.idleAnimation(toAnimate)
        });
        for (let i = 0; i < 3; i++) {
          this.createSmoke(toAnimate, left);
        }
        this.animateSmoke(left);
      }
    });
  }

  animateTrumpet(left?: boolean) {
    if (this.stopAnimating) return;
    const toAnimate = left ? this.trumpetLeft.nativeElement : this.trumpetRight.nativeElement;
    this.animated.push(toAnimate);
    const VFXs = (left ? this.vfxLeft : this.vfxRight).nativeElement.childNodes;
    this.animated.push(VFXs);
    const VFXsWithTransform = (Array.from(VFXs)).map((el: any, index) => {
      return {vfx: el, rotate: -30 + index * 30}
    })
    Anime({
      targets: toAnimate,
      translateX: (left ? 1 : -1) * 150 + '%',
      translateY: '-150%',
      easing: 'easeOutSine',
      complete: () => {
        if (this.stopAnimating) return;
        Anime({
          targets: toAnimate,
          scale: 1.2,
          loop: true,
          direction: 'alternate',
          duration: 300,
          loopBegin: (anim) => {
            if (this.stopAnimating) return;
            if (anim.progress < 50) {
              VFXsWithTransform.forEach((vfx) => {
                Anime({
                  targets: vfx.vfx,
                  rotate: [vfx.rotate, vfx.rotate],
                  opacity: [0, 1],
                  scaleX: [0, 1],
                  duration: 100,
                  direction: "alternate",
                  easing: "linear"
                });
              })
            }
          }
        });
      }
    });
  }
}
