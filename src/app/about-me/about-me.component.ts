import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent implements AfterViewInit {

  @Input() content: string[] = [];
  @Output() toBottom: EventEmitter<any> = new EventEmitter();
  @ViewChild('aboutMeContent') aboutMeContent!: ElementRef;
  @Output() shifted: EventEmitter<number> = new EventEmitter();
  vertical = false;

  constructor() {
  }

  ngAfterViewInit(): void {
    new ResizeObserver(() => this.checkIfVertical()).observe(this.aboutMeContent.nativeElement);
  }

  checkIfVertical() {
    let rect = this.aboutMeContent.nativeElement.getBoundingClientRect();
    this.shifted.emit(rect.height);
    if (this.vertical !== (rect.width < 800)) {
      this.vertical = rect.width < 800;
    }
  }
}
