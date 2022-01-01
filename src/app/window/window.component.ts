import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
  @Input() roundedBottom = true;
  @Input() width = 0
  @Input() height = 0;
  @Input() minWidth = 0
  @Input() minHeight = 0;
  @Input() scrollTop = 0;
  @Input() putIt: 'left' | 'right' | 'mid' = 'mid'
  @Input() y = 0;
  @Output() maximizeChange: EventEmitter<boolean> = new EventEmitter();
  size = {x: 900, y: 430};
  minSize = {x: 500, y: 430};
  location = {x: 0, y: 0};
  sizeBeforeMaximize: any;
  locBeforeMaximize: any;
  originalLocation: any;
  originalSize: any;
  originalMouseLocation: any;
  dragging = false;
  resizingX = false;
  resizingY = false;
  resizeLeft = true;
  maximized = false;
  shadowColor: any;
  opened = false;
  whiteText = true;
  touched = false;

  constructor() {
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
      this.color = Utils.getColor(this.color);
    }
    if (Utils.colorIsLight(this.color)) {
      this.whiteText = false;
    }
    if (this.bg[0] !== '#') {
      this.bg = Utils.getColor(this.bg);
    }
    this.originalSize = {...this.size};
    this.shadowColor = this.lightenDarkenColor(this.color, -50);
  }

  getMaximizedHeight() {
    return Utils.viewHeight - 50;
  }

  getWindow() {
    return this.window.nativeElement;
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
    if (this.opened) return;
    this.opened = true;
    Anime({
      targets: this.window.nativeElement,
      opacity: {value: [0, 1], duration: 100},
      scale: {value: [0.9, 1], duration: 100},
      easing: 'linear',
      duration: 100
    })
  }

  setHeight(newHeight: number) {
    if (!this.resizingY && this.size.y < newHeight + 50) {
      this.size.y = newHeight + 50;
    }
  }

  lightenDarkenColor(col: string, amt: number) {
    let usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
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
      if (this.sizeBeforeMaximize)
        this.size = this.sizeBeforeMaximize;
      if (stickToMouse) {
        let temp = {...this.originalMouseLocation};
        temp.y += this.scrollTop - 25;
        temp.x -= this.size.x / 2
        this.locBeforeMaximize = {...temp};
        this.originalLocation = {...this.locBeforeMaximize};
      }
      if (this.locBeforeMaximize)
        this.location = this.locBeforeMaximize;
      this.sizeBeforeMaximize = null;
      this.locBeforeMaximize = null;
      this.maximizeChange.emit(false);
      return;
    }
    this.maximized = true;
    if (!this.sizeBeforeMaximize || !this.locBeforeMaximize) {
      this.sizeBeforeMaximize = this.size;
      this.locBeforeMaximize = this.location;
    }
    this.location = {x: 0, y: this.scrollTop};
    this.size = {x: Utils.viewWidth, y: Utils.viewHeight};
    this.maximizeChange.emit(true);
  }

  startEditing(event: MouseEvent | TouchEvent, resize?: 'lx' | 'rx' | 'y' | 'lxy' | 'rxy') {
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
    this.originalLocation = {...this.location};
    if (!resize) {
      this.dragging = true;
      if (this.maximized) {
        this.maximizeMinimize(true);
      }
      return;
    }
    this.originalSize = {...this.size};
    this.resizeLeft = resize[0] === 'l';
    if (resize.includes('x')) {
      this.resizingX = true;
    }
    if (resize.includes('y')) {
      this.resizingY = true;
    }
  }

  editSize(event: MouseEvent) {
    if (!this.resizingX && !this.resizingY) return;
    if (this.resizingX && !this.resizeLeft) {
      this.size.x = (event.clientX - this.originalMouseLocation.x) + this.originalSize.x;
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
      }
    } else if (this.resizingX) {
      this.size.x = this.originalSize.x - (event.clientX - this.originalMouseLocation.x);
      if (this.size.x < this.minSize.x) {
        this.size.x = this.minSize.x;
        this.location.x = this.originalSize.x - this.size.x + this.originalLocation.x;
        return;
      }
      this.location.x = (event.clientX - this.originalMouseLocation.x) + this.originalLocation.x;
    }
    if (this.resizingY) {
      this.size.y = (event.clientY - this.originalMouseLocation.y) + this.originalSize.y;
      if (this.size.y < this.minSize.y) {
        this.size.y = this.minSize.y;
      }
    }
  }

  editPosition(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    if (event instanceof MouseEvent) {
      this.location.x = (event.clientX - this.originalMouseLocation.x) + this.originalLocation.x;
      this.location.y = (event.clientY - this.originalMouseLocation.y) + this.originalLocation.y;
    } else {
      this.location.x = (event.touches[0].clientX - this.originalMouseLocation.x) + this.originalLocation.x;
      this.location.y = (event.touches[0].clientY - this.originalMouseLocation.y) + this.originalLocation.y;
    }
  }
}
