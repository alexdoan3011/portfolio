import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreetingBgComponent } from './greeting-bg.component';

describe('GreetingBgComponent', () => {
  let component: GreetingBgComponent;
  let fixture: ComponentFixture<GreetingBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GreetingBgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GreetingBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
