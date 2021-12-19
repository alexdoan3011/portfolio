export var colors = new Map([
  ['bgDark', '#2B2B2B'],
  ['bgLightPink', '#FFC0CB'],
  ['bgLightGray', '#A8A89E'],
  ['bgYellow', '#FBAE3C'],
  ['bgLightBlue', '#4FACF7'],
  ['acPersianGreen', '#009b87']
])
const t = Array.from(colors.keys());
type colorType = typeof t[number];

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

  static getColor(name: colorType) {
    return document.body.style.getPropertyValue('--' + name)
  }
}
