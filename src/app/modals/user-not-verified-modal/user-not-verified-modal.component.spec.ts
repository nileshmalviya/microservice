import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNotVerifiedModalComponent } from './user-not-verified-modal.component';

describe('UserNotVerifiedModalComponent', () => {
  let component: UserNotVerifiedModalComponent;
  let fixture: ComponentFixture<UserNotVerifiedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserNotVerifiedModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserNotVerifiedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
