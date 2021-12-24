export var colors = new Map([
  ['myDark', '#2B2B2B'],
  ['myLightPink', '#FFC0CB'],
  ['myLightGray', '#A8A89E'],
  ['myYellow', '#FBAE3C'],
  ['myLightBlue', '#4FACF7'],
  ['myPersianGreen', '#009b87']
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

  static random30Percent(randomizeThis: number) {
    return randomizeThis * (100 + (Math.random() < 0.5 ? -1 : 1) * Math.random() * 30) / 100
  }

  static getColor(name: colorType) {
    return document.body.style.getPropertyValue('--' + name)
  }
}
