import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import Utils from '../utils';
import Anime from 'animejs';

type Point = { x: number; y: number };
type Placement = 'left' | 'right' | 'mid' | 'randomMid';
type ResizeHandle = 'l' | 'r' | 'b' | 't' | 'lb' | 'rb' | 'lt' | 'rt';

@Component({
  standalone: false,
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnDestroy {
  @ViewChild('window') window!: ElementRef<HTMLElement>;
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLElement>;
  @ViewChild('maximizeButton') maximizeButton!: ElementRef<HTMLElement>;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLElement>;

  readonly maximizeChange = new EventEmitter<WindowComponent>();
  readonly interacted = new EventEmitter<WindowComponent>();
  readonly editing = new EventEmitter<boolean>();
  readonly closed = new EventEmitter<WindowComponent>();
  readonly heightChange = new EventEmitter<number>();

  // Configuration (set by parent before ngOnInit)
  title = '';
  color: string = '';
  bg = '#FFFFFF';
  shadow = true;
  width = 0;
  height = 0;
  minWidth = 0;
  minHeight = 0;
  noScroll = false;
  putIt: Placement = 'mid';
  y = 0;
  zIndex = 1;
  hint = false;

  // Layout state
  readonly headerHeight = 30;
  size: Point = { x: 900, y: 430 };
  minSize: Point = { x: 500, y: 430 };
  maxSize: Point = { x: Utils.viewWidth, y: Utils.viewHeight };
  location: Point = { x: 0, y: 0 };

  private locBeforeMaximize: Point | null = null;
  private originalLocation: Point = { x: 0, y: 0 };
  private originalSize: Point = { x: 0, y: 0 };
  private originalMouseLocation: Point = { x: 0, y: 0 };

  // Interaction state
  dragging = false;
  resizingX = false;
  resizingY = false;
  resizeLeft = true;
  resizeTop = true;
  maximized = false;
  whiteText = true;
  touched = false;
  firstClick = false;
  stickToMouse = false;
  touchDelay = false;
  touchMaximize = false;

  readonly windowHintText = {
    general: 'You can move or resize this app. Give it a try!',
    maximize: 'Maximize',
    close: 'Close'
  } as const;
  readonly windowHintTextMobile = {
    general: 'Touch to move or maximize',
    maximize: 'Maximize',
    close: 'Close'
  } as const;

  readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly timeouts = new Set<number>();
  private rafId = 0;
  private destroyed = false;
  private globalListenersBound = false;
  private readonly mouseMoveHandler = (event: MouseEvent): void => {
    if (this.dragging) {
      this.editPosition(event);
    } else if (this.resizingX || this.resizingY) {
      this.editSize(event);
    } else {
      return;
    }
    // Global listeners run outside Angular's template-event scheduler,
    // so change detection has to be requested explicitly.
    this.cdr.markForCheck();
  };
  private readonly mouseUpHandler = (event: MouseEvent | TouchEvent): void => {
    this.stopEditing(event);
    this.cdr.markForCheck();
  };

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  isMobile(): boolean {
    return Utils.isMobile;
  }

  ngOnInit(): void {
    const vw = Utils.viewWidth;
    const vh = Utils.viewHeight;

    this.location.y = Math.round((this.y / 100) * vh);
    if (this.width !== 0) this.size.x = Math.round((this.width / 100) * vw);
    if (this.height !== 0) {
      this.size.y = Math.round((this.height / 100) * vh);
      this.emitContentHeight();
    }
    if (this.minWidth !== 0) this.minSize.x = Math.round((this.minWidth / 100) * vw);
    if (this.minHeight !== 0) this.minSize.y = Math.round((this.minHeight / 100) * vh);

    switch (this.putIt) {
      case 'mid':
        this.location.x = Math.round(vw / 2 - this.size.x / 2);
        break;
      case 'left':
        this.location.x = Math.round(vw * 0.05);
        break;
      case 'right':
        this.location.x = Math.round(vw * 0.95 - this.size.x);
        break;
      default:
        this.location.x = Math.round(Utils.random30Percent(vw / 2 - this.size.x / 2));
    }

    if (!this.color) {
      this.color = Utils.getRandomMaterialColor();
    } else if (this.color.startsWith('my')) {
      this.color = Utils.getMyColor(this.color);
    }
    if (Utils.colorIsLight(this.color)) this.whiteText = false;

    if (this.bg[0] !== '#') this.bg = Utils.getMyColor(this.bg);

    this.originalSize = { ...this.size };
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.destroyed = true;
    this.unbindGlobalListeners();
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts.clear();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.maximizeChange.complete();
    this.interacted.complete();
    this.editing.complete();
    this.closed.complete();
    this.heightChange.complete();
  }

  private setTimeoutTracked(fn: () => void, delay: number): void {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      if (!this.destroyed) fn();
    }, delay);
    this.timeouts.add(id);
  }

  private emitContentHeight(): void {
    this.heightChange.emit(this.size.y - this.headerHeight);
  }

  private bindGlobalListeners(): void {
    if (this.globalListenersBound) return;
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
    // Iframes swallow mouse events; keep them inert while editing so the
    // drag/resize doesn't freeze when the pointer passes over one.
    document.body.classList.add('window-editing');
    this.globalListenersBound = true;
  }

  private unbindGlobalListeners(): void {
    if (!this.globalListenersBound) return;
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    document.body.classList.remove('window-editing');
    this.globalListenersBound = false;
  }

  private isTouchEvent(event: Event): event is TouchEvent {
    // `instanceof TouchEvent` throws on browsers without the global (e.g. Firefox desktop).
    return typeof (event as TouchEvent).touches !== 'undefined';
  }

  private pointerOf(event: MouseEvent | TouchEvent): Point {
    if (this.isTouchEvent(event)) {
      const t = event.touches[0] ?? event.changedTouches[0];
      return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 };
    }
    return { x: event.clientX, y: event.clientY };
  }

  onInteracted(): void {
    this.interacted.emit(this);
    if (this.hint) {
      this.hint = false;
      this.window?.nativeElement.removeAttribute('aria-label');
      this.maximizeButton?.nativeElement.removeAttribute('aria-label');
      this.closeButton?.nativeElement.removeAttribute('aria-label');
    }
  }

  close(event: MouseEvent | TouchEvent): void {
    if (event instanceof MouseEvent && event.button !== 0) return;
    if (this.isTouchEvent(event) && event.cancelable) event.preventDefault();
    if (this.maximized) event.stopPropagation();
    if (this.maximized) this.maximizeMinimize(false);

    Anime({
      targets: this.window.nativeElement,
      opacity: { value: 0, duration: 100 },
      scale: [
        { value: [1, 0.9], duration: 100 },
        { value: 0, duration: 0 }
      ],
      easing: 'linear',
      duration: 100,
      complete: () => {
        if (this.destroyed) return;
        this.closed.emit(this);
        this.wrapper.nativeElement.remove();
      }
    });
  }

  open(): void {
    // Parent creates the component dynamically and may call open() before the view is rendered.
    // Wait for the ViewChild references via rAF instead of MutationObserver (lighter, auto-stops).
    const tick = () => {
      if (this.destroyed) return;
      if (!this.window) {
        this.rafId = requestAnimationFrame(tick);
        return;
      }
      this.rafId = 0;
      Anime({
        targets: this.window.nativeElement,
        opacity: { value: 1, duration: 100 },
        scale: { value: [0.9, 1], duration: 100 },
        easing: 'linear',
        duration: 100
      });
      if (this.hint) this.showHint();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private showHint(): void {
    this.setTimeoutTracked(() => {
      if (!this.window) return;
      const hintText = Utils.isMobile ? this.windowHintTextMobile : this.windowHintText;
      const win = this.window.nativeElement;
      const max = this.maximizeButton.nativeElement;
      const cls = this.closeButton.nativeElement;

      win.setAttribute('aria-label', hintText.general);
      win.setAttribute('data-balloon-break', '');
      max.setAttribute('aria-label', hintText.maximize);
      max.setAttribute('data-balloon-pos', 'up');
      max.setAttribute('data-balloon-break', '');
      cls.setAttribute('aria-label', hintText.close);
      cls.setAttribute('data-balloon-break', '');
      win.setAttribute('data-balloon-visible', '');
      max.setAttribute('data-balloon-visible', '');
      cls.setAttribute('data-balloon-visible', '');
    }, 500);
  }

  setMaxHeight(newMaxHeight: number): void {
    this.maxSize.y = Math.round(newMaxHeight + this.headerHeight);
    if (this.size.y > this.maxSize.y) {
      this.size.y = this.maxSize.y;
      this.emitContentHeight();
    }
  }

  setHeight(newHeight: number): void {
    if (this.resizingY || this.size.y >= newHeight + this.headerHeight) return;
    if (newHeight > 800 && !this.maximized) {
      this.size.y = 800;
    } else {
      this.size.y = Math.round(newHeight + this.headerHeight);
    }
    this.emitContentHeight();
  }

  stopEditing(event: MouseEvent | TouchEvent): void {
    this.unbindGlobalListeners();
    this.editing.emit(false);
    this.touched = false;
    this.dragging = false;
    this.resizingX = false;
    this.resizingY = false;
    this.setTimeoutTracked(() => (this.touchDelay = false), 250);
    if (this.isTouchEvent(event) && this.touchMaximize) {
      this.maximizeMinimize(false);
    }
  }

  maximizeMinimize(stickToMouse: boolean, event?: MouseEvent | TouchEvent): void {
    if (event) {
      if (event instanceof MouseEvent && event.button !== 0) return;
      if (this.isTouchEvent(event)) {
        this.touchDelay = true;
        if (event.cancelable) event.preventDefault();
      }
      if (this.maximized) event.stopPropagation();
    }
    this.stickToMouse = stickToMouse;
    this.maximizeChange.emit(this);
  }

  maximize(): void {
    this.maximized = true;
    if (!this.locBeforeMaximize) this.locBeforeMaximize = this.location;
    this.heightChange.emit(Utils.viewHeight - this.headerHeight);
  }

  minimize(scrollTop: number): void {
    this.maximized = false;
    if (this.stickToMouse) {
      const temp: Point = {
        x: this.originalMouseLocation.x - this.size.x / 2,
        y: this.originalMouseLocation.y + scrollTop - this.headerHeight / 2
      };
      this.locBeforeMaximize = { ...temp };
      this.originalLocation = { ...temp };
    }
    if (this.locBeforeMaximize) this.location = this.locBeforeMaximize;
    this.locBeforeMaximize = null;
  }

  getViewportHeight(): string {
    return Utils.viewHeight + 'px';
  }

  getViewportWidth(): string {
    return Utils.viewWidth + 'px';
  }

  startEditing(event: MouseEvent | TouchEvent, resize?: ResizeHandle): void {
    if ((event.target as HTMLElement).classList.contains('window-button')) {
      if (this.isTouchEvent(event)) this.touchDelay = true;
      return;
    }
    if (event instanceof MouseEvent && event.button !== 0) return;

    this.originalMouseLocation = this.pointerOf(event);

    if (this.isTouchEvent(event)) {
      if (event.cancelable) event.preventDefault();
      this.touched = true;
      this.touchDelay = true;
      this.touchMaximize = true;
      this.setTimeoutTracked(() => (this.touchMaximize = false), 250);
    }

    if (!this.firstClick) {
      this.firstClick = true;
      this.setTimeoutTracked(() => (this.firstClick = false), 250);
    } else {
      this.maximizeMinimize(false);
      return;
    }

    this.editing.emit(true);
    this.bindGlobalListeners();
    this.originalLocation = { ...this.location };

    if (!resize) {
      this.dragging = true;
      return;
    }

    this.originalSize = { ...this.size };
    this.resizeLeft = resize.includes('l');
    this.resizeTop = resize.includes('t');
    this.resizingX = resize.includes('l') || resize.includes('r');
    this.resizingY = resize.includes('t') || resize.includes('b');
  }

  editSize(event: MouseEvent): void {
    if (!this.resizingX && !this.resizingY) return;

    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

    if (this.resizingX) {
      const dx = event.clientX - this.originalMouseLocation.x;
      if (this.resizeLeft) {
        this.size.x = clamp(Math.round(this.originalSize.x - dx), this.minSize.x, this.maxSize.x);
        this.location.x = Math.round(this.originalSize.x - this.size.x + this.originalLocation.x);
      } else {
        this.size.x = clamp(Math.round(this.originalSize.x + dx), this.minSize.x, this.maxSize.x);
      }
    }

    if (this.resizingY) {
      const dy = event.clientY - this.originalMouseLocation.y;
      if (this.resizeTop) {
        this.size.y = clamp(Math.round(this.originalSize.y - dy), this.minSize.y, this.maxSize.y);
        this.location.y = Math.round(this.originalSize.y - this.size.y + this.originalLocation.y);
      } else {
        this.size.y = clamp(Math.round(this.originalSize.y + dy), this.minSize.y, this.maxSize.y);
      }
      this.emitContentHeight();
    }
  }

  editPosition(event: MouseEvent | TouchEvent): void {
    if (!this.dragging) return;
    event.stopPropagation();

    const p = this.pointerOf(event);
    const dx = p.x - this.originalMouseLocation.x;
    const dy = p.y - this.originalMouseLocation.y;

    if (this.maximized) {
      if (dx > 2 || dy > 2) {
        this.maximizeMinimize(true);
      } else {
        return;
      }
    }

    this.location.x = Math.round(dx + this.originalLocation.x);
    this.location.y = Math.round(dy + this.originalLocation.y);
  }
}
