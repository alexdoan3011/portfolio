import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarAnimateComponent } from './avatar-animate.component';

describe('AvatarAnimateComponent', () => {
  let component: AvatarAnimateComponent;
  let fixture: ComponentFixture<AvatarAnimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvatarAnimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarAnimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
