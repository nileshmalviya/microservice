import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaffleCountDownComponent } from './raffle-count-down.component';

describe('RaffleCountDownComponent', () => {
  let component: RaffleCountDownComponent;
  let fixture: ComponentFixture<RaffleCountDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaffleCountDownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaffleCountDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
