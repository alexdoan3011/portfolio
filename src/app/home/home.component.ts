import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Utils from "../utils";
import Anime from 'animejs';
import {GreetingComponent} from "../greeting/greeting.component";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('greetingComponent') greetingComponent!: GreetingComponent;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('content') content!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  displayGreeting = true;
  animated: HTMLElement[] = [];
  displaySwiper = true;


  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  hint() {
    this.animated.push(this.greetingContainer.nativeElement);
    this.animated.push(this.icon.nativeElement);
    Anime.timeline({
      targets: this.greetingContainer.nativeElement,
      keyframes:
        [
          {translateY: '-5vh', duration: 500, easing: 'easeOutSine'},
          {translateY: 0, duration: 500, easing: 'easeOutBounce'}
        ],
      loop: true,
      delay: 5000,
      loopBegin: () => this.icon.nativeElement.hidden = false,
    }).add({
      targets: this.icon.nativeElement,
      keyframes:
        [
          {opacity: 0, duration: 0},
          {opacity: [1, 0], duration: 1000},
        ],
      translateX: ['-50%', '-50%'],
      top: [Utils.viewHeight * 0.9, Utils.viewHeight * 0.7],
      easing: 'easeOutSine',
      duration: 1000,
      complete: () => this.icon.nativeElement.hidden = true,
    })
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
    })
  }

  returnViewHeight() {
    return Utils.viewHeight + 'px';
  }
}
