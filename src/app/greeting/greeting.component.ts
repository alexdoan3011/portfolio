import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild} from '@angular/core';
import Anime from 'animejs';
import {GreetingBgComponent} from 'src/app/greeting-bg/greeting-bg.component';
import * as d3 from 'd3';
import Utils from "../utils";

declare var require: any;

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss'],
})

export class GreetingComponent implements AfterViewInit {

  @ViewChild('hello') hello!: ElementRef;
  @ViewChild('and') and!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('welcome') welcome!: ElementRef;
  @ViewChild('greetingBgComponent') greetingBgComponent!: GreetingBgComponent
  @Output() cleanedUp: EventEmitter<HTMLElement> = new EventEmitter();
  @Output() cleaningUp: EventEmitter<any> = new EventEmitter();


  @HostListener('mousewheel', ['$event'])
  scroll(event?: WheelEvent) {
    if (!this.scrollAllowed) return;
    if (event) {
      if (event.deltaY > 0) {
        this.hammer.destroy();
        this.cleanUp();
        return;
      }
    } else {
      this.hammer.destroy();
      this.cleanUp();
    }
  }

  textTransformDuration = 500;
  sweep = false;
  animated: HTMLElement[] = [];
  hammer: any;
  scrollAllowed = false;


  constructor() {
  }

  ngAfterViewInit(): void {
    this.animateHello();
    this.hammer = new Hammer(this.wrapper.nativeElement);
    this.hammer.get('swipe').set({direction: Hammer.DIRECTION_VERTICAL});
    this.hammer.on('swipeup', () => this.scroll());
  }

  cleanUp() {
    if (this.sweep) return;
    this.sweep = true;
    this.greetingBgComponent.stopAnimations();
    Anime.remove(this.animated);
    this.greetingBgComponent.cleanUp();
    Anime({
      targets: this.and.nativeElement,
      opacity: 0,
      duration: this.textTransformDuration,
    })
    Anime({
      targets: this.welcome.nativeElement,
      translateX: '50%',
      translateY: '50%',
      easing: 'easeInOutSine',
      duration: 50,
      complete: () => {
        Anime({
          targets: this.welcome.nativeElement,
          top: ['50%', '25%'],
          left: ['50%', '50%'],
          scale: Utils.mobile ? 1 : 0.5,
          easing: 'easeInOutSine',
          duration: this.textTransformDuration,
        })
      }
    })
    this.welcome.nativeElement.style.filter = 'none';
    this.morphText();
  }

  startAnimations() {
    this.animateWelcome();
    this.greetingBgComponent.startAnimations();
  }

  async morphText() {
    const interpol = require('flubber');
    const firstText = [d3.select('#m1'), d3.select('#m2'), d3.select('#m3'), d3.select('#m4'), d3.select('#m5'), d3.select('#m6'), d3.select('#m7')]
    const secondTextPath = ['M0.5,77.8V5.7h11.8v72.1H0.5z',
      'M90.5,77.8l-2.3-7.6h-0.4c-2.6,3.3-5.3,5.6-7.9,6.8c-2.7,1.2-6.1,1.8-10.3,1.8c-5.4,0-9.5-1.4-12.6-4.3' +
      'c-3-2.9-4.5-7-4.5-12.3c0-5.6,2.1-9.9,6.3-12.7c4.2-2.9,10.5-4.4,19.1-4.7l9.4-0.3v-2.9c0-3.5-0.8-6.1-2.4-7.8' +
      'c-1.6-1.7-4.2-2.6-7.6-2.6c-2.8,0-5.5,0.4-8,1.2c-2.6,0.8-5,1.8-7.4,2.9L58.1,27c3-1.5,6.2-2.7,9.7-3.5c3.5-0.8,6.8-1.2,10-1.2' +
      'c6.9,0,12.2,1.5,15.7,4.5c3.5,3,5.3,7.8,5.3,14.3v36.7H90.5z M73.2,69.9c4.2,0,7.6-1.2,10.1-3.5c2.5-2.3,3.8-5.6,3.8-9.9v-4.7' +
      'l-7,0.3c-5.5,0.2-9.4,1.1-11.9,2.7c-2.5,1.6-3.7,4.1-3.7,7.5c0,2.4,0.7,4.3,2.2,5.6C68.1,69.2,70.3,69.9,73.2,69.9z',
      'M160.9,77.8h-11.6V44.2c0-4.2-0.8-7.3-2.4-9.3c-1.6-2.1-4-3.1-7.4-3.1c-4.5,0-7.8,1.5-9.8,4.4' +
      'c-2.1,2.9-3.1,7.8-3.1,14.5v27.2h-11.6V23.3h9.1l1.6,7.2h0.6c1.5-2.6,3.7-4.6,6.6-6c2.9-1.4,6-2.1,9.5-2.1c8.4,0,13.9,2.9,16.7,8.6' +
      'h0.8c1.6-2.7,3.9-4.8,6.8-6.3c2.9-1.5,6.3-2.3,10.1-2.3c6.5,0,11.3,1.6,14.2,4.9c3,3.3,4.5,8.3,4.5,15v35.6h-11.6V44.2' +
      'c0-4.2-0.8-7.3-2.4-9.3c-1.6-2.1-4.1-3.1-7.4-3.1c-4.5,0-7.8,1.4-9.9,4.2c-2.1,2.8-3.1,7.1-3.1,12.9V77.8z',
      'M283.7,77.8l-7.2-20h-27.6l-7.1,20h-12.4l27-72.4h12.8l27,72.4H283.7z M273.4,47.6L266.6,28' +
      'c-0.5-1.3-1.2-3.4-2-6.2c-0.9-2.8-1.5-4.9-1.8-6.2c-0.9,4-2.2,8.5-3.9,13.3l-6.5,18.8H273.4z', 'M316.1,77.8h-11.6V1.1h11.6V77.8z',
      'M356.5,78.8c-8.5,0-15.1-2.5-19.9-7.4c-4.8-4.9-7.2-11.8-7.2-20.4c0-8.9,2.2-15.9,6.7-21' +
      'c4.4-5.1,10.5-7.6,18.3-7.6c7.2,0,12.9,2.2,17.1,6.6c4.2,4.4,6.3,10.4,6.3,18.1v6.3h-36.3c0.2,5.3,1.6,9.4,4.3,12.2' +
      'c2.7,2.8,6.5,4.3,11.4,4.3c3.2,0,6.2-0.3,9-0.9s5.8-1.6,9-3v9.4c-2.8,1.3-5.7,2.3-8.6,2.9C363.5,78.5,360.2,78.8,356.5,78.8z' +
      ' M354.4,31c-3.7,0-6.6,1.2-8.9,3.5c-2.2,2.3-3.5,5.7-4,10.2h24.8c-0.1-4.5-1.2-7.9-3.3-10.2C360.9,32.2,358,31,354.4,31z',
      'M403,49.9l-18.3-26.7h13.2l12.4,19.1l12.5-19.1H436l-18.3,26.7l19.3,27.9h-13.1l-13.5-20.4l-13.4,20.4h-13.1' +
      'L403,49.9z']
    for (let i = 0; i < secondTextPath.length; i++) {
      const interpolator = interpol.interpolate(firstText[i].attr('d'), secondTextPath[i]);
      firstText[i].transition()
        .duration(this.textTransformDuration)
        .attrTween("d", function () {
          return interpolator;
        }).end().then(() => {
        if (i == secondTextPath.length - 1) {
          this.cleanedUp.emit(this.welcome.nativeElement);
        }
      })
      Anime({
        targets: firstText[i].node(),
        fill: i > 2 ? '#92374D' : '#fff',
        easing: 'linear',
        duration: this.textTransformDuration
      })
      Anime({
        targets: this.greetingBgComponent,
        opacity: 0,
        duration: this.textTransformDuration,
      })
    }
  }

  idleAnimation(target: HTMLElement | HTMLElement[], duration?: number) {
    Anime({
      targets: [target],
      translateX: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random50Percent(10),
      translateY: '+=' + (Math.random() < 0.5 ? 1 : -1) * Utils.random50Percent(10),
      direction: 'alternate',
      duration: duration ? duration : 600,
      easing: 'easeInOutSine',
      complete: () => {
        if (duration) {
          this.idleAnimation(target, duration);
        } else {
          this.idleAnimation(target);
        }
      }
    });
  }

  animateWelcome() {
    this.cleaningUp.emit();
    this.scrollAllowed = true;
    this.animated.push(this.welcome.nativeElement);
    Anime({
      targets: this.welcome.nativeElement,
      scale: [0, 1],
      duration: 1000,
      easing: "easeOutSine",
      complete: () => {
        this.idleAnimation(this.welcome.nativeElement, 2000);
      }
    });
  }

  animateHello() {
    this.hello.nativeElement.style.visibility = 'visible';
    this.hello.nativeElement.innerHTML = this.hello.nativeElement.textContent.replace(/\S/g, "<span>$&</span>");
    const toAnimate = this.hello.nativeElement.getElementsByTagName('span');
    this.animated.push(toAnimate);
    let comma = document.getElementById('comma');
    let helloContainer = document.getElementById('hello');
    Anime({
      targets: toAnimate,
      opacity: [0, 1],
      duration: 100,
      delay: Anime.stagger(100, {start: 1000}),
      complete: () => {
        window.setTimeout(() => {
          if (comma == null) return;
          comma.style.visibility = 'visible';
        }, 500)
        this.animateAnd();
        let originalPos = this.getTranslate(helloContainer)
        this.animated.push(this.hello.nativeElement);
        Anime({
          targets: document.getElementById('hello'),
          opacity: [1, 0],
          translateX: ['-50%', '-50%'],
          translateY: [originalPos[1], originalPos[1] - Utils.viewHeight],
          easing: "easeOutBounce",
          duration: 700,
          delay: 1000
        })
      }
    });
  }

  animateAnd() {
    let originalPos = this.getTranslate(this.and.nativeElement);
    this.animated.push(this.and.nativeElement);
    Anime({
      targets: this.and.nativeElement,
      translateX: ['-50%', '-50%'],
      translateY: [originalPos[1], originalPos[1] - Utils.viewHeight],
      easing: "easeOutBounce",
      duration: 700,
      delay: 1000,
      complete: () => this.startAnimations()
    })
    const svgPath = this.and.nativeElement.getElementsByTagName('path');
    this.animated.push(svgPath);
    Anime({
      targets: svgPath,
      strokeDashoffset: [Anime.setDashoffset, 0],
      strokeWidth: 3,
      easing: 'linear',
      duration: 3000,
      delay: (el, i) => {
        Anime({
          targets: el,
          fill: '#ffffff',
          easing: 'linear',
          duration: 1000,
          delay: i * 500 + 2000,
        });
        return i * 500
      },
    })
  }

  getTranslate(myElement: HTMLElement | null) {
    if (!myElement) return [0, 0];
    const style = window.getComputedStyle(myElement);
    const matrix = new WebKitCSSMatrix(style.transform);
    return [matrix.m41, matrix.m42];
  }
}
