import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import Utils from "../utils";
import {AvatarAnimateComponent} from "../avatar-animate/avatar-animate.component";
import Anime from "animejs";

@Component({
  selector: 'app-contact-me',
  templateUrl: './contact-me.component.html',
  styleUrls: ['./contact-me.component.scss']
})
export class ContactMeComponent implements AfterViewInit {

  @ViewChild(AvatarAnimateComponent) avatarAnimateComponent!: AvatarAnimateComponent;
  @ViewChild('avatarAnimateContainer') avatarAnimateContainer!: ElementRef;
  @ViewChild('avatarBg') avatarBg!: ElementRef;
  shutMouth = false;
  allowAnimate = false;
  avatarPosX = 30;
  avatarPosY = 50;
  avatarPosXMobile = 50;
  avatarPosYMobile = 15;
  pauseAnimation = false;

  constructor() {
  }

  ngAfterViewInit() {
  }

  isMobile() {
    return Utils.mobile;
  }

  setPauseAnimation(paused: boolean) {
    if (!this.allowAnimate) return;
    this.pauseAnimation = paused;
    this.avatarAnimateComponent.sleep(paused);
  }

  setMouth(open: boolean) {
    if (!this.allowAnimate) return;
    this.shutMouth = !open;
  }

  animateAvatar() {
    const rapidBlink = window.setInterval(() => {
      this.avatarAnimateComponent.blinkNow();
    }, 300)
    Anime({
      targets: this.avatarAnimateContainer.nativeElement,
      translateY: [
        {value: ['100%', '30%'], duration: 500, easing: 'easeOutExpo', delay: 1000},
      ],
      translateX: ['20%', '20%'],
      scaleY: [
        {value: 1.1, duration: 100, easing: 'easeOutExpo', delay: 1000},
        {value: 1, duration: 600, easing: 'easeOutBack'},
      ],
      complete: () => {
        window.clearInterval(rapidBlink);
        Anime({
          targets: this.avatarAnimateContainer.nativeElement,
          translateY: [
            {value: ['30%', '-10%'], duration: 500, easing: 'easeOutBack', delay: 1000}
          ],
          translateX: ['20%', '20%'],
          scaleY: [
            {value: 1.2, duration: 100, easing: 'easeOutBack', delay: 1000},
            {value: 1, duration: 500, easing: 'easeOutBack'}
          ],
          complete: () => {
            this.avatarAnimateComponent.blinkNow();
            this.avatarAnimateComponent.startAnimations();
            this.idleAnimation();
            window.setTimeout(() => {
              this.allowAnimate = true;
              this.setMouth(false)
            }, 500);
          }
        })
      }
    })
  }

  idleAnimation() {
    if (this.pauseAnimation) {
      window.requestAnimationFrame(() => {
        this.idleAnimation();
      })
      return;
    }
    Anime({
      targets: this.avatarAnimateContainer.nativeElement,
      translateX: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random30Percent(1),
      translateY: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random30Percent(1),
      direction: 'alternate',
      duration: 2000,
      easing: 'easeInOutSine',
      complete: () => {
        this.idleAnimation();
      }
    });
  }

  getViewportHeight() {
    return Utils.viewHeight;
  }

  getViewportWidth() {
    return Utils.viewWidth;
  }
}
