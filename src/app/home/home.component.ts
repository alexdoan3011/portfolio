import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
  @ViewChild(NgScrollbar) scrollRef!: NgScrollbar;
  @ViewChild(ContactMeComponent) contactMeComponent: ContactMeComponent | undefined;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('disable') disable!: ElementRef;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('content') content!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  displayGreeting = true; //TODO true
  greetingInteract = this.displayGreeting;
  animated: HTMLElement[] = [];
  contentJson: Content = contentJson;
  allowScroll = !this.displayGreeting;
  avatarAnimated = false;
  hideScrollTimer: any;
  toShow = false;
  disableInteractions = false;
  scrollTop = 0;
  yPos = [70, 120, 150];
  yPosMobile = [70, 146, 200];
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
    this.showIfHovered();
    this.scrollRef.scrolled.subscribe((e: any) => {
      window.requestAnimationFrame(() => {
        const rect = this.wrapper.nativeElement.getBoundingClientRect()
        this.scrollTop = -rect.top;
        if (this.scrollTop > (rect.height - Utils.viewHeight * 2)) {
          this.scrollTop = rect.height - Utils.viewHeight * 2;
        }
        this.yPos.forEach((y, index) => {
          if ((this.scrollTop / Utils.viewHeight + 0.5) * 100 >= y) {
            if (!this.windowComponent.get((index))!.opened)
              this.windowComponent.get(index)!.open();
          }
        })
        this.showScrollbar();
        this.borderAnimateComponents.forEach((bac) => {
          bac.updateTopOffset();
        })
        if (!this.avatarAnimated && this.contactMeComponent && e.target.scrollTop + Utils.viewHeight * 1.8 >= e.target.scrollHeight) {
          if (!this.scrollRef.state.verticalDragging && !this.disableInteractions) {
            this.scrollToBottom();
          }
          this.avatarAnimated = true;
          this.contactMeComponent.animateAvatar();
        }
      })
    });
  }

  windowMaximizeChange(maximized: boolean) {
    this.maximized = maximized;
    if (maximized) {
      this.beforeMaximize = document.getElementById('without-contact-me')!.getBoundingClientRect().bottom;
      if (this.beforeMaximize < Utils.viewHeight) {
        this.scrollRef.scrollTo({left: 0, bottom: Utils.viewHeight, duration: 0})
      } else {
        this.beforeMaximize = null
      }
    } else {
      if (this.beforeMaximize) {
        this.scrollRef.scrollTo({left: 0, bottom: this.beforeMaximize, duration: 0})
      }
    }
  }

  setZIndexes(event: MouseEvent | TouchEvent) {
    this.windowComponent.forEach((win, index) => {
      if (win.getWindow().contains(event.target)) {
        if (this.zIndexes[index] === this.zIndexes.length) return;
        this.zIndexes.forEach((zIndex, i) => {
          if (i !== index && zIndex >= this.zIndexes[index]) {
            this.zIndexes[i]--;
          }
        })
        this.zIndexes[index] = this.zIndexes.length;
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
    this.toShow = true;
    this.switchScrollbarVisibility(true);
    if (this.hideScrollTimer) {
      window.clearTimeout(this.hideScrollTimer);
    }
    this.hideScrollTimer = window.setTimeout(() => {
      this.toShow = false;
      this.switchScrollbarVisibility(false);
    }, 1000);
  }

  switchScrollbarVisibility(show: boolean, currentVisibility?: number) {
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
    this.hint();
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
