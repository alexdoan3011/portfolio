import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Utils from "../utils";
import Anime from 'animejs';
import {GreetingComponent} from "../greeting/greeting.component";
import {IntroductionAnimateComponent} from "../introduction-animate/introduction-animate.component";
import {Content} from "../models/content";
import contentJson from "../../assets/content.json";
import {NgScrollbar} from "ngx-scrollbar";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(GreetingComponent) greetingComponent!: GreetingComponent;
  @ViewChild(IntroductionAnimateComponent) introductionAnimateComponent!: IntroductionAnimateComponent;
  @ViewChild(NgScrollbar) scrollRef!: NgScrollbar;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('content') content!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  displayGreeting = true; //TODO true
  greetingInteract = this.displayGreeting;
  animated: HTMLElement[] = [];
  contentJson: Content = contentJson;
  allowScroll = false;
  hideScrollTimer: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.displayGreeting) {
      this.allowScroll = true;
    }
    this.scrollRef.scrolled.subscribe(() => {
      this.showScrollbar();
      this.showIfHovered();
    });
  }

  showIfHovered() {
    window.requestAnimationFrame(() => {
      if (this.scrollRef.state.verticalHovered) {
        this.showScrollbar();
      }
      this.showIfHovered();
    })
  }

  showScrollbar() {
    this.switchScrollbarVisibility(true);
    if (this.hideScrollTimer) {
      window.clearTimeout(this.hideScrollTimer);
    }
    this.hideScrollTimer = window.setTimeout(() => this.switchScrollbarVisibility(false), 2000);
    this.introductionAnimateComponent.updateTopOffset();
  }

  switchScrollbarVisibility(show: boolean, currentVisibility?: number) {
    if (!currentVisibility) {
      currentVisibility = 0.2;
    }
    if (!show) {
      if (currentVisibility! <= 0) {
        return;
      }
      currentVisibility! -= 0.01;
    }
    window.requestAnimationFrame(() => {
      this.scrollRef.nativeElement.style.setProperty('--scrollbar-thumb-color', 'rgba(255, 255, 255, ' + currentVisibility + ')');
      if (!show) {
        this.switchScrollbarVisibility(show, currentVisibility);
      }
    })
  }

  removeGreeting() {
    this.displayGreeting = false;
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

  getViewportHeight() {
    return Utils.viewHeight + 'px';
  }

  setNamePos(e: HTMLElement) {
    let div = e.cloneNode(true) as HTMLElement;
    e.remove();
    div.style.transform = 'scale(1) translateX(-50%) translateY(-50%)';
    const top = Number(div.style.top.match(/[\d.]*/gm)![0]) * 2 * Utils.viewHeight / 100;
    div.style.top = '50%';
    this.nameContainer.nativeElement.style.height = top / Utils.viewHeight * 100 + 'vh';
    div.style.zIndex = '100';
    this.nameContainer.nativeElement.appendChild(div);
  }

  allowScrolling() {
    this.allowScroll = true;
    this.animated.push(this.greetingContainer.nativeElement);
    this.animated.push(this.icon.nativeElement);
    this.hint();
  }

  setUpDisplay() {
    Anime.remove(this.animated);
    this.introductionAnimateComponent.updateTopOffset();
    this.introductionAnimateComponent.startAnimating();
    this.greetingInteract = false;
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
