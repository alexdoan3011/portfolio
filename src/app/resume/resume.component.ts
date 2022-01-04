import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent {
  @ViewChild('resumeContent') resumeContent!: ElementRef;
  @Output() shifted: EventEmitter<number> = new EventEmitter();
  vertical = false;

  constructor() {
  }

  ngAfterViewInit(): void {
    new ResizeObserver(() => this.checkIfVertical()).observe(this.resumeContent.nativeElement);
  }

  checkIfVertical() {
    let rect = this.resumeContent.nativeElement.getBoundingClientRect();
    this.shifted.emit(rect.height);
    this.vertical = rect.width < 1000;
  }
}
