import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import Utils from "../utils";

@Component({
  selector: 'app-border-animate',
  templateUrl: './border-animate.component.html',
  styleUrls: ['./border-animate.component.scss']
})
export class BorderAnimateComponent implements OnInit, AfterViewInit {

  @ViewChild('path') path!: ElementRef;
  @ViewChild('svg') svg!: ElementRef;
  @Input() color: string = 'myDark';
  currentX = 0;
  currentY = 0;
  newX = 0;
  newY = 0;
  topOffset = 0;
  private animated = false;
  private isOutsideViewport = false;
  private bottomLimit = 200;


  constructor() {
  }

  ngOnInit(): void {
    this.color = Utils.getMyColor(this.color);
  }

  ngAfterViewInit(): void {
    this.topOffset = this.svg.nativeElement.getBoundingClientRect().top;
  }

  startAnimating() {
    this.animated = true;
    this.animateLines();
  }

  updateTopOffset() {
    if (!this.animated) return;
    window.requestAnimationFrame(() => {
      this.topOffset = this.svg.nativeElement.getBoundingClientRect().top;
      this.isOutsideViewport = (this.topOffset + this.bottomLimit / 2) < 0;
    });
  }

  update() {
    this.newX = Utils.mouseX;
    this.newY = (Utils.mouseY - this.topOffset) * 2;
    if (this.newY < 0) this.newY = 0;
    if (this.newY > this.bottomLimit) this.newY = this.bottomLimit;
  }

  animateLines() {
    window.requestAnimationFrame(() => {
      if (this.isOutsideViewport && this.currentY != 0) {
        this.currentX = Utils.viewWidth / 2;
        this.currentY = 0;
      } else if (!this.isOutsideViewport) {
        this.update();
        this.currentX += (this.newX - this.currentX) / 200;
        this.currentY += (this.newY - this.currentY) / 200;
        if (this.currentY < 1) {
          this.currentX = Utils.viewWidth / 2;
          this.currentY = 0;
        } else {
          this.svg.nativeElement.setAttribute('viewBox', '0 0 ' + Utils.viewWidth + ' 1000');
          this.path.nativeElement.setAttribute('d', 'M0,0 Q' + this.currentX + ',' + this.currentY + ' ' + Utils.viewWidth + ',0');
        }
      }
      this.animateLines();
    })
  }
}
