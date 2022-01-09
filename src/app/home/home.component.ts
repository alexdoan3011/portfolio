import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren, ViewContainerRef,
} from '@angular/core';
import Utils from "../utils";
import Anime from 'animejs';
import {BorderAnimateComponent} from "../border-animate/border-animate.component";
import {Content} from "../models/content";
import contentJson from "../../assets/content.json";
import {NgScrollbar} from "ngx-scrollbar";
import {ContactMeComponent} from "../contact-me/contact-me.component";
import {WindowComponent} from "../window/window.component";
import {AboutMeComponent} from "../about-me/about-me.component";
import {ComponentType} from "@angular/cdk/overlay";
import {ResumeComponent} from "../resume/resume.component";
import {IframeWrapperComponent} from "../iframe-wrapper/iframe-wrapper.component";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChildren(BorderAnimateComponent) borderAnimateComponents!: QueryList<BorderAnimateComponent>;
  @ViewChild('windowContainer') windowContainer!: ElementRef;
  @ViewChild('insertWindowHere', {read: ViewContainerRef, static: true}) insertWindowHere!: ViewContainerRef;
  @ViewChild('introductionText') introductionText!: ElementRef;
  @ViewChild(NgScrollbar) scrollRef!: NgScrollbar;
  @ViewChild('fullScreenContainer') fullScreenContainer!: ElementRef;
  @ViewChild(ContactMeComponent) contactMeComponent?: ContactMeComponent;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('disable') disable!: ElementRef;
  @ViewChild('nameContainer') nameContainer!: ElementRef;
  @ViewChild('greetingContainer') greetingContainer!: ElementRef;
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('icon') icon!: ElementRef;
  windows: WindowComponent[] = [];
  displayHint = true;
  displayGreeting = true;
  animated: HTMLElement[] = [];
  contentJson: Content = contentJson;
  avatarAnimated = false;
  hideScrollTimer: any;
  toShow = false;
  disableInteractions = false;
  yPos = [40, 80, 150];
  yPosMobile = [40, 80, 150];
  maximized = false;
  beforeMaximize = 0;
  editingWindow = false;
  windowHint = false;

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
    this.animated.push(this.icon.nativeElement);
    this.scrollDownHint();
    this.showScrollBarIfHovered();
    this.scrollRef.scrolled.subscribe((e: any) => {
      window.requestAnimationFrame(() => {
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

  renderWindow(content: ComponentType<any>, option?: { title?: string, height?: number, width?: number, y?: number, source?: string, noScroll?: boolean, putIt?: 'left' | 'right' | 'mid' | 'randomMid', shifted?: 'height' | 'maxHeight' }) {
    const newWinContent = this.insertWindowHere.createComponent(content);
    const newWin = this.insertWindowHere.createComponent(WindowComponent, {
      index: this.windows.length === 0 ? undefined : this.windows.length,
      injector: undefined,
      ngModuleRef: undefined,
      projectableNodes: [[newWinContent.location.nativeElement]]
    });
    this.windows.push(newWin.instance);
    if (!this.windowHint) {
      this.windowHint = true;
      newWin.instance.hint = true;
    }
    newWin.instance.width = this.isMobile() ? 90 : 0;
    newWin.instance.zIndex = this.windows.length;
    newWin.instance.width = this.isMobile() ? 90 : 60;
    newWin.instance.interacted.subscribe((event) => this.setZIndexes(event));
    newWin.instance.editing.subscribe((event) => this.editingWindow = event);
    newWin.instance.maximizeChange.subscribe((event) => this.windowMaximizeChange(event));
    if (content === AboutMeComponent) {
      newWinContent.instance.toBottom.subscribe(() => {
        if (this.maximized) {
          this.windows.forEach((win) => {
            if (win.maximized) {
              win.maximizeMinimize(false);
            }
          })
          const resizeObserver = new ResizeObserver(() => {
            this.scrollToBottom();
            resizeObserver.unobserve(this.wrapper.nativeElement);
          });
          resizeObserver.observe(this.wrapper.nativeElement);
        } else {
          this.scrollToBottom();
        }
      });
    } else if (content === IframeWrapperComponent) {
      newWin.instance.heightChange.subscribe((event) => newWinContent.instance.iframeHeight = event);
    }
    newWin.instance.open();
    if (!option) return;
    if (option.source) newWinContent.instance.source = option.source;
    newWin.instance.y = -this.wrapper.nativeElement.getBoundingClientRect().top / Utils.viewHeight * 100 + (option.y ? option.y : Utils.random30Percent(20));
    newWin.instance.noScroll = option.noScroll ? option.noScroll : false;
    newWin.instance.width = option.width ? option.width : 0;
    newWin.instance.title = option.title ? option.title : '';
    newWin.instance.height = option.height ? option.height : 0;
    newWin.instance.putIt = option.putIt ? option.putIt : 'mid';
    newWin.instance.closed.subscribe((event) => this.closeWindow(event));
    if (option && option.shifted === "height") {
      newWinContent.instance.shifted.subscribe((event: number) => newWin.instance.setHeight(event))
    } else if (option && option.shifted === "maxHeight") {
      newWinContent.instance.shifted.subscribe((event: number) => newWin.instance.setMaxHeight(event))
    }
  }

  windowMaximizeChange(window: WindowComponent) {
    const scrollTop = -this.wrapper.nativeElement.getBoundingClientRect().top;
    if (this.maximized) {
      const resizeObserver = new ResizeObserver(() => {
        this.scrollRef.scrollTo({left: 0, top: this.beforeMaximize, duration: 0});
        resizeObserver.unobserve(this.wrapper.nativeElement);
      });
      resizeObserver.observe(this.wrapper.nativeElement);
      this.maximized = false;
      window.minimize(scrollTop);
    } else {
      this.beforeMaximize = scrollTop;
      this.scrollRef.scrollTo({left: 0, top: 0, duration: 0});
      this.maximized = true;
      window.maximize();
    }
    this.maximized = window.maximized;
  }

  setZIndexes(window: WindowComponent) {
    this.windows.forEach((win) => {
      if (window === win) {
        if (win.zIndex === this.windows.length) return;
        win.zIndex = this.windows.length;
      } else if (win.zIndex > 1) {
        win.zIndex--;
      }
    })
  }

  closeWindow(window: WindowComponent) {
    const index = this.windows.indexOf(window);
    this.windows.splice(index, 1);
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
    return Utils.isMobile;
  }

  scrollDownHint() {
    if (!this.greetingContainer) return;
    if (!this.icon) return;
    if (Utils.isMobile) {
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
    Utils.isMobileSwitch.subscribe((isMobile) => {
      div.style.transform = (isMobile ? 'scale(1)' : 'scale(0.5)') + ' translateX(-50%) translateY(-50%)';
    })
    this.nameContainer.nativeElement.appendChild(div);
    this.setUpDisplay();
  }

  openApp(appName: string) {
    if (appName.toLowerCase() === 'about me') {
      this.renderWindow(AboutMeComponent, {
        title: 'About me',
        width: this.isMobile() ? 90 : 50,
        putIt: this.isMobile() ? "mid" : "randomMid",
        shifted: 'height'
      })
    } else if (appName.toLowerCase() === 'my resume') {
      this.renderWindow(ResumeComponent, {
        title: 'My resume',
        width: this.isMobile() ? 90 : 70,
        putIt: this.isMobile() ? "mid" : "randomMid",
        height: 70,
        shifted: 'maxHeight'
      })
    } else if (appName.toLowerCase() === 'ai racer') {
      this.renderWindow(IframeWrapperComponent, {
        title: 'AI Racer (In development)',
        width: this.isMobile() ? 90 : 70,
        putIt: this.isMobile() ? "mid" : "randomMid",
        height: 70,
        source: './projects/ai-racer',
        noScroll: true
      })
    } else if (appName.toLowerCase() === 'clock') {
      this.renderWindow(IframeWrapperComponent, {
        title: 'Astronomy Clock',
        width: this.isMobile() ? 90 : 70,
        putIt: this.isMobile() ? "mid" : "randomMid",
        height: 70,
        source: './projects/clock',
        noScroll: true
      })
    }
  }

  setUpDisplay() {
    Anime.remove(this.animated);
    this.borderAnimateComponents.forEach((bac) => {
      bac.updateTopOffset();
      bac.startAnimating();
    })
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
