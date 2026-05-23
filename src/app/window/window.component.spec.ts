import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowComponent } from './window.component';

describe('AboutMeComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render fullscreen blocker overlays while dragging', () => {
    component.dragging = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.blocker')).toBeNull();
  });
});
