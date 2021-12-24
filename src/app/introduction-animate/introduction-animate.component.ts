import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import Utils from "../utils";

@Component({
  selector: 'app-introduction-animate',
  templateUrl: './introduction-animate.component.html',
  styleUrls: ['./introduction-animate.component.scss']
})
export class IntroductionAnimateComponent implements AfterViewInit {

  @ViewChild('path') path!: ElementRef;
  @ViewChild('svg') svg!: ElementRef;
  currentX = 0;
  currentY = 0;
  newX = 0;
  newY = 0;
  color = Utils.getColor('myDark');
  mouseX = 0;
  mouseY = 0;
  topOffset = 0;
  private animated = false;


  constructor() {
  }

  ngAfterViewInit(): void {
    this.topOffset = this.svg.nativeElement.getBoundingClientRect().top;
  }

  startAnimating() {
    window.onmousemove = async (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
    this.animated = true;
    this.animateLines();
  }

  updateTopOffset() {
    if (!this.animated) return;
    window.requestAnimationFrame(() => {
        this.topOffset = this.svg.nativeElement.getBoundingClientRect().top;
      });
  }

  update() {
    this.newX = this.mouseX;
    this.newY = (this.mouseY - this.topOffset) * 2;
    if (this.newY < 0) this.newY = 0;
    if (this.newY > 1000) this.newY = 1000;
  }

  animateLines() {
    window.requestAnimationFrame(() => {
      this.update();
      this.currentX += (this.newX - this.currentX) / 200;
      this.currentY += (this.newY - this.currentY) / 200;
      this.svg.nativeElement.setAttribute('viewBox', '0 0 ' + Utils.viewWidth + ' 1000');
      this.path.nativeElement.setAttribute('d', 'M0,0 Q' + this.currentX + ',' + this.currentY + ' ' + Utils.viewWidth + ',0');
      this.animateLines();
    })
  }
}
