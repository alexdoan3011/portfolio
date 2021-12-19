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
  color = Utils.getColor('bgDark');
  mouseX = 0;
  mouseY = 0;


  constructor() {
  }

  ngAfterViewInit(): void {
    this.svg.nativeElement.setAttribute('viewBox', '0 0 ' + Utils.viewWidth + ' 1000');
    window.onmousemove = async (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
    this.animateLines();
  }

  update() {
    this.newX = this.mouseX;
    this.newY = (this.mouseY - this.svg.nativeElement.getBoundingClientRect().top)*2;
    if (this.newY < 0) this.newY = 0;
    if (this.newY > 1000) this.newY = 1000;
  }

  animateLines() {
    window.requestAnimationFrame(() => {
      this.update();
      this.currentX += (this.newX - this.currentX) / 100;
      this.currentY += (this.newY - this.currentY) / 100;
      this.path.nativeElement.setAttribute('d', 'M0,0 Q' + this.currentX + ',' + this.currentY + ' ' + Utils.viewWidth + ',0');
      this.animateLines();
    })
  }
}
