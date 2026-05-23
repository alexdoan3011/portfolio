import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, Output, Renderer2, ViewChild} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('resumeContent') resumeContent!: ElementRef;
  @Output() shifted: EventEmitter<number> = new EventEmitter();
  private vertical: boolean | null = null;
  resizeObserver?: ResizeObserver;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    // Run outside Angular and toggle classes imperatively (Renderer2) to avoid
    // NG0100 when ResizeObserver fires around Angular's CD check pass.
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.checkIfVertical());
      this.resizeObserver.observe(this.resumeContent.nativeElement);
      this.checkIfVertical();
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  checkIfVertical() {
    const el = this.resumeContent.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    const next = rect.width < 1000;
    if (next !== this.vertical) {
      this.vertical = next;
      if (next) {
        this.renderer.addClass(el, 'flex-column');
        this.renderer.removeClass(el, 'flex-row');
      } else {
        this.renderer.removeClass(el, 'flex-column');
        this.renderer.addClass(el, 'flex-row');
      }

      const sections = el.querySelectorAll(':scope > .resume-section');
      sections.forEach(section => {
        if (next) {
          this.renderer.removeClass(section, 'equal-width');
        } else {
          this.renderer.addClass(section, 'equal-width');
        }
      });
    }
    setTimeout(() => this.ngZone.run(() => this.shifted.emit(rect.height)));
  }
}
