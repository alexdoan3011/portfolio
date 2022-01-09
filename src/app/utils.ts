declare var require: any;
import {EventEmitter} from "@angular/core";
export default class Utils {

  static viewWidth = window.innerWidth;
  static viewHeight = window.innerHeight;
  static isMobile = Utils.viewHeight > Utils.viewWidth;
  static mouseX = 0;
  static mouseY = 0;
  private static randomMC: any;
  static isMobileSwitch: EventEmitter<boolean> = new EventEmitter();
  static windowResize: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  static updateMousePos(e: MouseEvent) {
    window.requestAnimationFrame(() => {
      Utils.mouseX = e.clientX;
      Utils.mouseY = e.clientY;
    })
  }

  static updateViewSize() {
    window.requestAnimationFrame(() => {
      Utils.viewWidth = window.innerWidth;
      Utils.viewHeight = window.innerHeight;
      if (Utils.isMobile!== Utils.viewHeight > Utils.viewWidth) {
        Utils.isMobile = Utils.viewHeight > Utils.viewWidth;
        Utils.isMobileSwitch.emit(Utils.isMobile);
      }
    })
  }

  static random30Percent(randomizeThis: number) {
    return randomizeThis * (100 + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 30) / 100
  }

  static getRandomColor() {
    return "hsl(" + 360 * Math.random() + ', 100%, ' +
      (33 + 33 * Math.random()) + '%)'
  }

  static getMyColor(name: string) {
    return window.getComputedStyle(document.documentElement).getPropertyValue('--' + name);
  }

  static getRandomMaterialColor() {
    if (!Utils.randomMC) Utils.randomMC = require('random-material-color');
    return Utils.randomMC.getColor();
  }

  static colorIsLight(color: any) {
    let r, g, b, hsp;
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
      r = color[1];
      g = color[2];
      b = color[3];
    } else {
      color = +("0x" + color.slice(1).replace(
          color.length < 5 && /./g, '$&$&'
        )
      );
      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }
    hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );
    return hsp > 200;
  }
}
