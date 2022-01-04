import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  @Input() title: string = '';
  @Input() color: any;
  @Input() bg: string = '#FFFFFF';
  @Input() shadow = true;
  @Input() width = 0
  @Input() height = 0;
  @Input() minWidth = 0
  @Input() minHeight = 0;
  @Input() scrollTop = 0;
  @Input() putIt: 'left' | 'right' | 'mid' = 'mid'
  @Input() y = 0;
  @Input() zIndex = 1;
  @Output() maximizeChange: EventEmitter<WindowComponent> = new EventEmitter();
  @Output() interacted: EventEmitter<WindowComponent> = new EventEmitter();
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
  opened = false;
  whiteText = true;
  touched = false;
  firstOpened = false;
  firstClick = false;
  elementRef: ElementRef

  constructor(element: ElementRef) {
    this.elementRef = element;
  }

  ngOnInit(): void {
    this.location.y = this.y / 100 * Utils.viewHeight;
    if (this.width !== 0) {
      this.size.x = this.width / 100 * Utils.viewWidth;
    }
    if (this.height !== 0) {
      this.size.y = this.height / 100 * Utils.viewHeight;
    }
    if (this.minWidth !== 0) {
      this.minSize.x = this.minWidth / 100 * Utils.viewWidth;
    }
    if (this.minHeight !== 0) {
      this.minSize.y = this.minHeight / 100 * Utils.viewHeight;
    }
    if (this.putIt === 'mid') {
      this.location.x = Utils.viewWidth / 2 - this.size.x / 2;
    } else if (this.putIt === 'left') {
      this.location.x = Utils.viewWidth * 0.05;
    } else {
      this.location.x = Utils.viewWidth * 0.95 - this.size.x;
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

  getMaximizedHeight() {
    return Utils.viewHeight - this.headerHeight;
  }

  onInteracted() {
    this.interacted.emit(this);
  }

  getWindow() {
    if (this.window)
      return this.window.nativeElement;
    return null;
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
        this.opened = false;
        if (this.maximized) this.maximizeMinimize(false);
      }
    })
  }

  open() {
    if (!this.firstOpened) this.firstOpened = true;
    if (this.opened) return;
    this.opened = true;
    const observer = new MutationObserver((mutations, me) => {
      if (this.window) {
        Anime({
          targets: this.window.nativeElement,
          opacity: {value: [0, 1], duration: 100},
          scale: {value: [0.9, 1], duration: 100},
          easing: 'linear',
          duration: 100
        });
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
    this.maxSize.y = newMaxHeight + this.headerHeight;
    if (this.size.y > this.maxSize.y) {
      this.size.y = this.maxSize.y;
    }
  }

  setHeight(newHeight: number) {
    if (!this.resizingY && this.size.y < newHeight + this.headerHeight) {
      if (newHeight > 800 && !this.maximized) {
        this.size.y = 800;
      } else {
        this.size.y = newHeight + this.headerHeight;
      }
    }
  }

  stopEditing() {
    this.touched = false;
    this.dragging = false;
    this.resizingX = false;
    this.resizingY = false;
  }

  maximizeMinimize(stickToMouse: boolean, event?: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      if (event.button !== 0) return;
    }
    if (event && this.maximized) {
      event.stopPropagation();
    }
    if (this.maximized) {
      this.maximized = false;
      if (stickToMouse) {
        let temp = {...this.originalMouseLocation};
        temp.y += this.scrollTop - 25;
        temp.x -= this.size.x / 2
        this.locBeforeMaximize = {...temp};
        this.originalLocation = {...this.locBeforeMaximize};
      }
      if (this.locBeforeMaximize)
        this.location = this.locBeforeMaximize;
      this.locBeforeMaximize = null;
    } else {
      this.maximized = true;
      if (!this.locBeforeMaximize) {
        this.locBeforeMaximize = this.location;
      }
      this.location = {x: 0, y: this.scrollTop};
    }
    this.maximizeChange.emit(this);
  }

  getViewportHeight() {
    return Utils.viewHeight + 'px';
  }

  getViewportWidth() {
    return Utils.viewWidth + 'px';
  }

  startEditing(event: MouseEvent | TouchEvent, resize?: 'l' | 'r' | 'b' | 't' | 'lb' | 'rb' | 'lt' | 'rt') {
    if ((event.target as HTMLElement).classList.contains('window-button')) {
      return;
    }
    if (event instanceof MouseEvent) {
      if (event.button !== 0) return;
      this.originalMouseLocation = {x: event.clientX, y: event.clientY};
      this.touched = false;
    } else {
      this.originalMouseLocation = {x: event.touches[0].clientX, y: event.touches[0].clientY};
      this.touched = true;
    }
    if (!this.firstClick) {
      this.firstClick = true;
      window.setTimeout(() => this.firstClick = false, 250);
    } else {
      this.maximizeMinimize(false);
      return;
    }
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
      this.size.x = this.originalSize.x - (event.clientX - this.originalMouseLocation.x);
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
        this.location.x = this.originalSize.x - this.size.x + this.originalLocation.x;
      } else if (this.size.x > this.maxSize.x) {
        this.size.x = this.maxSize.x;
        this.location.x = this.originalSize.x - this.size.x + this.originalLocation.x;
      } else {
        this.location.x = (event.clientX - this.originalMouseLocation.x) + this.originalLocation.x;
      }
    } else if (this.resizingX) {
      this.size.x = (event.clientX - this.originalMouseLocation.x) + this.originalSize.x;
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
      } else if (this.size.x > this.maxSize.x) {
        this.size.x = this.maxSize.x;
      }
    }
    if (this.resizingY && this.resizeTop) {
      this.size.y = this.originalSize.y - (event.clientY - this.originalMouseLocation.y);
      if (this.size.y < this.minSize.y) {
        this.size.y = this.minSize.y;
        this.location.y = this.originalSize.y - this.size.y + this.originalLocation.y;
      } else if (this.size.y > this.maxSize.y) {
        this.size.y = this.maxSize.y;
        this.location.y = this.originalSize.y - this.size.y + this.originalLocation.y;
      } else {
        this.location.y = (event.clientY - this.originalMouseLocation.y) + this.originalLocation.y;
      }
    } else if (this.resizingY) {
      this.size.y = (event.clientY - this.originalMouseLocation.y) + this.originalSize.y;
      if (this.size.y < this.minSize.y) {
        this.size.y = this.minSize.y;
      } else if (this.size.y > this.maxSize.y) {
        this.size.y = this.maxSize.y;
      }
    }
  }

  editPosition(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    if (event instanceof MouseEvent) {
      if (this.maximized && ((event.clientX - this.originalMouseLocation.x) > 2 || (event.clientY - this.originalMouseLocation.y) > 2)) {
        this.maximizeMinimize(true);
      } else if (this.maximized) {
        return;
      }
      this.location.x = (event.clientX - this.originalMouseLocation.x) + this.originalLocation.x;
      this.location.y = (event.clientY - this.originalMouseLocation.y) + this.originalLocation.y;
    } else {
      if (this.maximized && ((event.touches[0].clientX - this.originalMouseLocation.x) > 2 || (event.touches[0].clientY - this.originalMouseLocation.y) > 2)) {
        this.maximizeMinimize(true);
      } else if (this.maximized) {
        return;
      }
      this.location.x = (event.touches[0].clientX - this.originalMouseLocation.x) + this.originalLocation.x;
      this.location.y = (event.touches[0].clientY - this.originalMouseLocation.y) + this.originalLocation.y;
    }
  }
}
