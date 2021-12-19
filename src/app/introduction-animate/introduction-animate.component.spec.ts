import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionAnimateComponent } from './introduction-animate.component';

describe('IntroductionAnimateComponent', () => {
  let component: IntroductionAnimateComponent;
  let fixture: ComponentFixture<IntroductionAnimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroductionAnimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroductionAnimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
