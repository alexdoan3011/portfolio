import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Utils from "../utils";
import Anime from 'animejs';
import {GreetingComponent} from "../greeting/greeting.component";
import {Content} from "../models/content";
import {IntroductionAnimateComponent} from "../introduction-animate/introduction-animate.component";
import contentJson from "../../assets/content.json";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('greetingComponent') greetingComponent!: GreetingComponent;
  @ViewChild('introductionAnimateComponent') introductionAnimateComponent!: IntroductionAnimateComponent;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('content') content!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  displayGreeting = true;
  animated: HTMLElement[] = [];
  displaySwiper = true;
  contentJson: Content;


  constructor() {
    this.contentJson = contentJson;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this.wrapper.nativeElement.classList.remove('stop-scrolling');
  }

  isMobile() {
    return Utils.mobile;
  }

  hint() {
    if (Utils.mobile) {
      Anime({
        targets: this.greetingContainer.nativeElement,
        keyframes:
          [
            {translateY: '-5vh', duration: 500, easing: 'easeOutSine'},
            {translateY: 0, duration: 500, easing: 'easeOutBounce'}
          ],
        delay: 5000,
      })
      Anime({
        targets: this.icon.nativeElement,
        keyframes:
          [
            {opacity: 0, duration: 0},
            {opacity: [1, 0], duration: 1000},
          ],
        top: [Utils.viewHeight * 0.9, Utils.viewHeight * 0.7],
        easing: 'easeOutSine',
        duration: 1000,
        delay: 5000,
        complete: () => {
          this.hint()
        }
      })
    } else {
      this.icon.nativeElement.style.opacity = '1';
      Anime({
        targets: this.icon.nativeElement,
        opacity: [1, 1],
        top: [Utils.viewHeight * 0.93, Utils.viewHeight * 0.95],
        easing: 'easeInOutSine',
        direction: "alternate",
        duration: 1000,
        complete: () => {
          this.hint()
        }
      })
    }
  }

  setNamePos(e: HTMLElement) {
    let div = e.cloneNode(true) as HTMLElement;
    div.style.transform = 'scale(1) translateX(-50%) translateY(-50%)';
    const top = Number(div.style.top.match(/[\d.]*/gm)![0]) * 2 * Utils.viewHeight / 100;
    div.style.top = '50%';
    this.nameContainer.nativeElement.style.height = top / Utils.viewHeight * 100 + 'vh';
    div.style.zIndex = '100';
    this.nameContainer.nativeElement.appendChild(div);
  }

  allowScrolling() {
    this.wrapper.nativeElement.classList.remove('stop-scrolling');
    this.animated.push(this.greetingContainer.nativeElement);
    this.animated.push(this.icon.nativeElement);
    this.hint();
  }

  setUpDisplay() {
    Anime.remove(this.animated);
    this.displaySwiper = false;
    this.displayGreeting = false;
    const btn = document.getElementById('old-btn')!
    Anime({
      targets: btn,
      scale: [0, 1],
      easing: 'easeOutBack',
      duration: 500,
      complete: () => btn.setAttribute('data-balloon-visible', '')
    });
  }

  returnViewHeight() {
    return Utils.viewHeight + 'px';
  }
}
