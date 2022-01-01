import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorderAnimateComponent } from './border-animate.component';

describe('IntroductionAnimateComponent', () => {
  let component: BorderAnimateComponent;
  let fixture: ComponentFixture<BorderAnimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorderAnimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorderAnimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
