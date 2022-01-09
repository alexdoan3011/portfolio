import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent implements AfterViewInit, OnDestroy {

  @Output() toBottom: EventEmitter<any> = new EventEmitter();
  @ViewChild('aboutMeContent') aboutMeContent!: ElementRef;
  @Output() shifted: EventEmitter<number> = new EventEmitter();
  vertical = false;
  resizeObserver: any;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.checkIfVertical());
    this.resizeObserver.observe(this.aboutMeContent.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver.unobserve(this.aboutMeContent.nativeElement);
  }

  checkIfVertical() {
    let rect = this.aboutMeContent.nativeElement.getBoundingClientRect();
    this.shifted.emit(rect.height);
    this.vertical = rect.width < 800;
  }
}
