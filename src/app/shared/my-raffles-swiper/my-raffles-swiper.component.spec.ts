import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRafflesSwiperComponent } from './my-raffles-swiper.component';

describe('MyRafflesSwiperComponent', () => {
  let component: MyRafflesSwiperComponent;
  let fixture: ComponentFixture<MyRafflesSwiperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyRafflesSwiperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRafflesSwiperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
