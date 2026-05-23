import {AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, Output, Renderer2, ViewChild} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent implements AfterViewInit, OnDestroy {

  @Output() toBottom: EventEmitter<any> = new EventEmitter();
  @ViewChild('aboutMeContent') aboutMeContent!: ElementRef;
  @Output() shifted: EventEmitter<number> = new EventEmitter();
  private vertical = false;
  resizeObserver: any;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    // Run the observer outside Angular so its callbacks never piggy-back on an
    // in-flight CD cycle. The `flex-column` class is toggled imperatively via
    // Renderer2 (not a template binding) to avoid NG0100 when ResizeObserver
    // fires during/around Angular's check pass. `shifted` is emitted via
    // setTimeout so the parent CD cascade also happens in a later task.
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.checkIfVertical());
      this.resizeObserver.observe(this.aboutMeContent.nativeElement);
    });
  }

  ngOnDestroy() {
    this.resizeObserver.unobserve(this.aboutMeContent.nativeElement);
  }

  checkIfVertical() {
    const el = this.aboutMeContent.nativeElement;
    const rect = el.getBoundingClientRect();
    const next = rect.width < 800;
    const height = rect.height;
    if (next !== this.vertical) {
      this.vertical = next;
      if (next) {
        this.renderer.addClass(el, 'flex-column');
      } else {
        this.renderer.removeClass(el, 'flex-column');
      }
    }
    setTimeout(() => this.ngZone.run(() => this.shifted.emit(height)));
  }
}
