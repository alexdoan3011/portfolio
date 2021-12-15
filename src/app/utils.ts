export default class Utils {

  static viewWidth = window.innerWidth;
  static viewHeight = window.innerHeight;
  static mobile = Utils.viewHeight > Utils.viewWidth;

  constructor() {
  }

  static updateViewSize() {
    Utils.viewWidth = window.innerWidth;
    Utils.viewHeight = window.innerHeight;
    Utils.mobile = Utils.viewHeight > Utils.viewWidth;
  }

  static random50Percent(randomizeThis: number) {
    return randomizeThis * (100 + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 50) / 100
  }
}
