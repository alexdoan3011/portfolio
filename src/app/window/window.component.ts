import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild
} from '@angular/core';
import Utils from "../utils";
import Anime from "animejs";

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
  @ViewChild('window') window!: ElementRef;
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('maximizeButton') maximizeButton!: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;
  maximizeChange: EventEmitter<WindowComponent> = new EventEmitter();
  interacted: EventEmitter<WindowComponent> = new EventEmitter();
  editing: EventEmitter<boolean> = new EventEmitter();
  closed: EventEmitter<WindowComponent> = new EventEmitter();
  heightChange: EventEmitter<number> = new EventEmitter();
  title: string = '';
  color: any;
  bg: string = '#FFFFFF';
  shadow = true;
  width = 0;
  height = 0;
  minWidth = 0
  minHeight = 0;
  noScroll = false
  putIt: 'left' | 'right' | 'mid' | 'randomMid' = 'mid'
  y = 0;
  zIndex = 1;
  headerHeight = 30;
  size = {x: 900, y: 430};
  minSize = {x: 500, y: 430};
  maxSize = {x: Utils.viewWidth, y: Utils.viewHeight};
  location = {x: 0, y: 0};
  locBeforeMaximize: any;
  originalLocation: any;
  originalSize: any;
  originalMouseLocation: any;
  dragging = false;
  resizingX = false;
  resizingY = false;
  resizeLeft = true;
  resizeTop = true;
  maximized = false;
  whiteText = true;
  touched = false;
  firstClick = false;
  stickToMouse = false;
  hint = false;
  touchDelay = false;
  touchMaximize = false;
  windowHintText = {
    general: 'You can move or resize this app. Give it a try!',
    maximize: 'Maximize',
    close: 'Close'
  };
  windowHintTextMobile = {general: 'Touch to move or maximize', maximize: 'Maximize', close: 'Close'};

  constructor(public elementRef: ElementRef) {
  }

  isMobile() {
    return Utils.isMobile;
  }

  ngOnInit(): void {
    this.location.y = Math.round(this.y / 100 * Utils.viewHeight);
    if (this.width !== 0) {
      this.size.x = Math.round(this.width / 100 * Utils.viewWidth);
    }
    if (this.height !== 0) {
      this.size.y = Math.round(this.height / 100 * Utils.viewHeight);
      this.heightChange.emit(this.size.y - this.headerHeight);
    }
    if (this.minWidth !== 0) {
      this.minSize.x = Math.round(this.minWidth / 100 * Utils.viewWidth);
    }
    if (this.minHeight !== 0) {
      this.minSize.y = Math.round(this.minHeight / 100 * Utils.viewHeight);
    }
    if (this.putIt === 'mid') {
      this.location.x = Math.round(Utils.viewWidth / 2 - this.size.x / 2);
    } else if (this.putIt === 'left') {
      this.location.x = Math.round(Utils.viewWidth * 0.05);
    } else if (this.putIt === 'right') {
      this.location.x = Math.round(Utils.viewWidth * 0.95 - this.size.x);
    } else {
      this.location.x = Math.round(Utils.random30Percent(Utils.viewWidth / 2 - this.size.x / 2));
    }
    if (!this.color) {
      this.color = Utils.getRandomMaterialColor();
    } else if (this.color[0] === 'm' && this.color[1] === 'y') {
      this.color = Utils.getMyColor(this.color);
    }
    if (Utils.colorIsLight(this.color)) {
      this.whiteText = false;
    }
    if (this.bg[0] !== '#') {
      this.bg = Utils.getMyColor(this.bg);
    }
    this.originalSize = {...this.size};
  }

  onInteracted() {
    this.interacted.emit(this);
    if (this.hint) {
      this.hint = false;
      this.window.nativeElement.removeAttribute('aria-label');
      this.maximizeButton.nativeElement.removeAttribute('aria-label');
      this.closeButton.nativeElement.removeAttribute('aria-label');
    }
  }

  close(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      if (event.button !== 0) return;
    }
    if (event && this.maximized) {
      event.stopPropagation();
    }
    Anime({
      targets: this.window.nativeElement,
      opacity: {value: 0, duration: 100},
      scale: [
        {value: [1, 0.9], duration: 100},
        {value: 0, duration: 0}
      ],
      easing: 'linear',
      duration: 100,
      complete: () => {
        this.closed.emit(this);
        if (this.maximized) this.maximizeMinimize(false);
        this.wrapper.nativeElement.remove();
      }
    })
  }

  open() {
    const observer = new MutationObserver((mutations, me) => {
      if (this.window) {
        Anime({
          targets: this.window.nativeElement,
          opacity: {value: [0, 1], duration: 100},
          scale: {value: [0.9, 1], duration: 100},
          easing: 'linear',
          duration: 100
        });
        if (this.hint) {
          window.setTimeout(() => {
            if (this.window) {
              const hintText = Utils.isMobile ? this.windowHintTextMobile : this.windowHintText;
              this.window.nativeElement.setAttribute('aria-label', hintText.general);
              this.window.nativeElement.setAttribute('data-balloon-break', '');
              this.maximizeButton.nativeElement.setAttribute('aria-label', hintText.maximize);
              this.maximizeButton.nativeElement.setAttribute('data-balloon-pos', 'up');
              this.maximizeButton.nativeElement.setAttribute('data-balloon-break', '');
              this.closeButton.nativeElement.setAttribute('aria-label', hintText.close);
              this.closeButton.nativeElement.setAttribute('data-balloon-break', '');
              this.window.nativeElement.setAttribute('data-balloon-visible', '')
              this.maximizeButton.nativeElement.setAttribute('data-balloon-visible', '')
              this.closeButton.nativeElement.setAttribute('data-balloon-visible', '')
            }
          }, 500)
        }
        me.disconnect(); // stop observing
        return;
      } else {
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }
    });

// start observing
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  setMaxHeight(newMaxHeight: number) {
    this.maxSize.y = Math.round(newMaxHeight + this.headerHeight);
    if (this.size.y > this.maxSize.y) {
      this.size.y = this.maxSize.y;
      this.heightChange.emit(this.size.y - this.headerHeight);
    }
  }

  setHeight(newHeight: number) {
    if (!this.resizingY && this.size.y < newHeight + this.headerHeight) {
      if (newHeight > 800 && !this.maximized) {
        this.size.y = 800;
        this.heightChange.emit(this.size.y - this.headerHeight);
      } else {
        this.size.y = Math.round(newHeight + this.headerHeight);
        this.heightChange.emit(this.size.y - this.headerHeight);
      }
    }
  }

  stopEditing(event: MouseEvent | TouchEvent) {
    this.editing.emit(false);
    this.touched = false;
    this.dragging = false;
    this.resizingX = false;
    this.resizingY = false;
    window.setTimeout(() => {
      this.touchDelay = false
    }, 250);
    if (event instanceof TouchEvent && this.touchMaximize) {
      this.maximizeMinimize(false);
    }
  }

  maximizeMinimize(stickToMouse: boolean, event?: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      if (event.button !== 0) return;
    } else if (event instanceof TouchEvent) {
      this.touchDelay = true;
    }
    if (event && this.maximized) {
      event.stopPropagation();
    }
    this.stickToMouse = stickToMouse;
    this.maximizeChange.emit(this);
  }

  maximize() {
    this.maximized = true;
    if (!this.locBeforeMaximize) {
      this.locBeforeMaximize = this.location;
    }
    this.heightChange.emit(Utils.viewHeight - this.headerHeight);
  }

  minimize(scrollTop: number) {
    this.maximized = false;
    if (this.stickToMouse) {
      let temp = {...this.originalMouseLocation};
      temp.y += scrollTop - this.headerHeight / 2;
      temp.x -= this.size.x / 2
      this.locBeforeMaximize = {...temp};
      this.originalLocation = {...this.locBeforeMaximize};
    }
    if (this.locBeforeMaximize)
      this.location = this.locBeforeMaximize;
    this.locBeforeMaximize = null;
  }

  getViewportHeight() {
    return Utils.viewHeight + 'px';
  }

  getViewportWidth() {
    return Utils.viewWidth + 'px';
  }

  startEditing(event: MouseEvent | TouchEvent, resize?: 'l' | 'r' | 'b' | 't' | 'lb' | 'rb' | 'lt' | 'rt') {
    if ((event.target as HTMLElement).classList.contains('window-button')) {
      if (event instanceof TouchEvent) {
        this.touchDelay = true;
      }
      return;
    }
    if (event instanceof MouseEvent) {
      if (event.button !== 0) return;
      this.originalMouseLocation = {x: event.clientX, y: event.clientY};
    } else {
      this.originalMouseLocation = {x: event.touches[0].clientX, y: event.touches[0].clientY};
      this.touched = true;
      this.touchDelay = true;
      this.touchMaximize = true;
      window.setTimeout(() => this.touchMaximize = false, 250);
    }
    if (!this.firstClick) {
      this.firstClick = true;
      window.setTimeout(() => this.firstClick = false, 250);
    } else {
      this.maximizeMinimize(false);
      return;
    }
    this.editing.emit(true);
    this.originalLocation = {...this.location};
    if (!resize) {
      this.dragging = true;
      return;
    }
    this.originalSize = {...this.size};
    switch (resize) {
      case "l":
        this.resizeLeft = true;
        break;
      case "lt":
        this.resizeTop = true;
        this.resizeLeft = true;
        break;
      case "lb":
        this.resizeTop = false;
        this.resizeLeft = true;
        break;
      case "r":
        this.resizeLeft = false;
        break;
      case "rt":
        this.resizeTop = true;
        this.resizeLeft = false;
        break;
      case "rb":
        this.resizeTop = false;
        this.resizeLeft = false;
        break;
      case "b":
        this.resizeTop = false;
        break;
      case "t":
        this.resizeTop = true;
    }
    if (resize.includes('r') || resize.includes('l')) {
      this.resizingX = true;
    }
    if (resize.includes('t') || resize.includes('b')) {
      this.resizingY = true;
    }
  }

  editSize(event: MouseEvent) {
    if (!this.resizingX && !this.resizingY) return;
    if (this.resizingX && this.resizeLeft) {
      this.size.x = Math.round(this.originalSize.x - (event.clientX - this.originalMouseLocation.x));
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
        this.location.x = Math.round(this.originalSize.x - this.size.x + this.originalLocation.x);
      } else if (this.size.x > this.maxSize.x) {
        this.size.x = this.maxSize.x;
        this.location.x = Math.round(this.originalSize.x - this.size.x + this.originalLocation.x);
      } else {
        this.location.x = Math.round((event.clientX - this.originalMouseLocation.x) + this.originalLocation.x);
      }
    } else if (this.resizingX) {
      this.size.x = Math.round((event.clientX - this.originalMouseLocation.x) + this.originalSize.x);
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
      } else if (this.size.x > this.maxSize.x) {
        this.size.x = this.maxSize.x;
      }
    }
    if (this.resizingY && this.resizeTop) {
      this.size.y = Math.round(this.originalSize.y - (event.clientY - this.originalMouseLocation.y));
      this.heightChange.emit(this.size.y - this.headerHeight);
      if (this.size.y < this.minSize.y) {
        this.size.y = this.minSize.y;
        this.heightChange.emit(this.size.y - this.headerHeight);
        this.location.y = Math.round(this.originalSize.y - this.size.y + this.originalLocation.y);
      } else if (this.size.y > this.maxSize.y) {
        this.size.y = this.maxSize.y;
        this.heightChange.emit(this.size.y - this.headerHeight);
        this.location.y = Math.round(this.originalSize.y - this.size.y + this.originalLocation.y);
      } else {
        this.location.y = Math.round((event.clientY - this.originalMouseLocation.y) + this.originalLocation.y);
      }
    } else if (this.resizingY) {
      this.size.y = Math.round((event.clientY - this.originalMouseLocation.y) + this.originalSize.y);
      this.heightChange.emit(this.size.y - this.headerHeight);
      if (this.size.y < this.minSize.y) {
        this.size.y = this.minSize.y;
        this.heightChange.emit(this.size.y - this.headerHeight);
      } else if (this.size.y > this.maxSize.y) {
        this.size.y = this.maxSize.y;
        this.heightChange.emit(this.size.y - this.headerHeight);
      }
    }
  }

  editPosition(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    event.stopPropagation();
    if (event instanceof MouseEvent) {
      if (this.maximized && ((event.clientX - this.originalMouseLocation.x) > 2 || (event.clientY - this.originalMouseLocation.y) > 2)) {
        this.maximizeMinimize(true);
      } else if (this.maximized) {
        return;
      }
      this.location.x = Math.round((event.clientX - this.originalMouseLocation.x) + this.originalLocation.x);
      this.location.y = Math.round((event.clientY - this.originalMouseLocation.y) + this.originalLocation.y);
    } else {
      if (this.maximized && ((event.touches[0].clientX - this.originalMouseLocation.x) > 2 || (event.touches[0].clientY - this.originalMouseLocation.y) > 2)) {
        this.maximizeMinimize(true);
      } else if (this.maximized) {
        return;
      }
      this.location.x = Math.round((event.touches[0].clientX - this.originalMouseLocation.x) + this.originalLocation.x);
      this.location.y = Math.round((event.touches[0].clientY - this.originalMouseLocation.y) + this.originalLocation.y);
    }
  }
}
