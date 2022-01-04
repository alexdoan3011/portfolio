import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import Utils from "../utils";
import Anime from 'animejs';
import {BorderAnimateComponent} from "../border-animate/border-animate.component";
import {Content} from "../models/content";
import contentJson from "../../assets/content.json";
import {NgScrollbar} from "ngx-scrollbar";
import {ContactMeComponent} from "../contact-me/contact-me.component";
import {WindowComponent} from "../window/window.component";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChildren(BorderAnimateComponent) borderAnimateComponents!: QueryList<BorderAnimateComponent>;
  @ViewChildren(WindowComponent) windowComponent!: QueryList<WindowComponent>;
  @ViewChild('windowContainer') windowContainer!: ElementRef;
  @ViewChild(NgScrollbar) scrollRef!: NgScrollbar;
  @ViewChild('fullScreenContainer') fullScreenContainer!: ElementRef;
  @ViewChild(ContactMeComponent) contactMeComponent?: ContactMeComponent;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('disable') disable!: ElementRef;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  displayGreeting = true;
  greetingInteract = this.displayGreeting;
  animated: HTMLElement[] = [];
  contentJson: Content = contentJson;
  allowScroll = !this.displayGreeting;
  avatarAnimated = false;
  hideScrollTimer: any;
  toShow = false;
  disableInteractions = false;
  scrollTop = 0;
  yPos = [40, 80, 150];
  yPosMobile = [40, 80, 150];
  zIndexes = [1, 2, 3];
  maximized = false;
  beforeMaximize: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.displayGreeting) {
      this.borderAnimateComponents.forEach((bac) => {
        bac.updateTopOffset();
        bac.startAnimating();
      })
    }
    this.showScrollBarIfHovered();
    this.scrollRef.scrolled.subscribe((e: any) => {
      window.requestAnimationFrame(() => {
        if (!this.maximized)
          this.scrollTop = -this.wrapper.nativeElement.getBoundingClientRect().top;
        this.yPos.forEach((y, index) => {
          if ((this.scrollTop / Utils.viewHeight + 0.5) * 100 >= y) {
            if (!this.windowComponent.get((index))!.firstOpened)
              this.windowComponent.get(index)!.open();
          }
        })
        this.showScrollBar();
        this.borderAnimateComponents.forEach((bac) => {
          bac.updateTopOffset();
        })
        if (!this.avatarAnimated && !this.maximized && this.contactMeComponent && e.target.scrollTop + Utils.viewHeight * 1.8 >= e.target.scrollHeight) {
          if (!this.scrollRef.state.verticalDragging && !this.disableInteractions) {
            this.scrollToBottom();
          }
          this.avatarAnimated = true;
          this.contactMeComponent.animateAvatar();
        }
      })
    });
  }

  windowMaximizeChange(window: WindowComponent) {
    if (window.maximized)
      this.fullScreenContainer.nativeElement.appendChild(window.elementRef.nativeElement);
    else
      this.windowContainer.nativeElement.appendChild(window.elementRef.nativeElement);
    this.maximized = window.maximized;
  }

  setZIndexes(window: WindowComponent) {
    this.windowComponent.forEach((win, index) => {
      if (!win.opened) {
        this.zIndexes[index] = 1;
      } else if (window === win) {
        if (this.zIndexes[index] === this.zIndexes.length) return;
        this.zIndexes[index] = this.zIndexes.length;
        this.zIndexes.forEach((zIndex, i) => {
          if (i !== index && this.zIndexes[i] > 1) {
            this.zIndexes[i]--;
          }
        })
      }
    })
  }

  openWindow(name: string) {
    this.windowComponent.forEach((win) => {
      if (win.title.toLowerCase() === name.toLowerCase()) {
        win.open();
      }
    })
  }

  scrollToBottom() {
    const scrollHeight = this.wrapper.nativeElement.offsetHeight;
    this.disableInteractions = true;
    this.scrollRef.scrollTo({left: 0, top: scrollHeight, duration: scrollHeight / 4}).then(() => {
      this.disableInteractions = false;
    });
    window.setTimeout(() => {
      this.disableInteractions = false;
    }, scrollHeight / 4);
    if (this.maximized) {
      this.windowComponent.forEach((win) => {
        if (win.maximized) {
          win.maximizeMinimize(false);
        }
      })
    }
  }

  showScrollBarIfHovered() {
    window.requestAnimationFrame(() => {
      if (this.scrollRef && this.scrollRef.state.verticalHovered) {
        this.showScrollBar();
      }
      this.showScrollBarIfHovered();
    })
  }

  showScrollBar() {
    this.toShow = true;
    this.switchScrollBarVisibility(true);
    if (this.hideScrollTimer) {
      window.clearTimeout(this.hideScrollTimer);
    }
    this.hideScrollTimer = window.setTimeout(() => {
      this.toShow = false;
      this.switchScrollBarVisibility(false);
    }, 1000);
  }

  switchScrollBarVisibility(show: boolean, currentVisibility?: number) {
    if (this.toShow && !show) {
      return;
    }
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
        this.switchScrollBarVisibility(show, currentVisibility);
      }
    })
  }

  removeGreeting() {
    this.displayGreeting = false;
  }

  isMobile() {
    return Utils.mobile;
  }

  scrollDownHint() {
    if (!this.greetingContainer) return;
    if (Utils.mobile) {
      Anime({
        targets: this.greetingContainer.nativeElement,
        keyframes:
          [
            {translateY: '-2vh', duration: 500, easing: 'easeOutSine'},
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
          this.scrollDownHint()
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
          this.scrollDownHint()
        }
      })
    }
  }

  getViewportHeight() {
    return Utils.viewHeight + 'px';
  }

  getViewportWidth() {
    return Utils.viewWidth + 'px';
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
    this.scrollDownHint();
  }

  setUpDisplay() {
    Anime.remove(this.animated);
    this.borderAnimateComponents.forEach((bac) => {
      bac.updateTopOffset();
      bac.startAnimating();
    })
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
}
