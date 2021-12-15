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
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('content') content!: ElementRef;
  displayGreeting = true;


  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  hint() {
    Anime({
      targets: this.greetingComponent,
      translateY: '-5vh',
      duration: 500,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutBounce'
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
  }

  setUpDisplay() {
    this.displayGreeting = false;
  }

  returnViewHeight() {
    return Utils.viewHeight + 'px';
  }
}
