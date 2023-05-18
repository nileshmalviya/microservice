import { Component, Input, OnInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DEALS } from './deals-mock';

@Component({
  selector: 'app-daily-deals',
  templateUrl: './daily-deals.component.html'
})

export class DailyDealsComponent implements OnInit {
  // @Input() public dailyDealsSlider: any;
  public deals = DEALS;

  public dailyDealsSlider: SwiperConfigInterface = {
    slidesPerView: 1.575,
    spaceBetween: -50,
    centeredSlides: true,
    watchOverflow: true,
    loop: true,
    speed: 500,
    // autoplay: {
    //   delay: 5000,
    // },
    // Responsive breakpoints
    breakpoints: {
      768: {
        spaceBetween: 0,
        slidesPerView: 1.8
      },
      1280: {
        spaceBetween: 0,
        slidesPerView: 'auto',
        centeredSlides: true,
      }
    },
    navigation: {
      nextEl: '.daily-deals-button-next',
      prevEl: '.daily-deals-button-prev',
    },

  };

  constructor() { }

  ngOnInit(): void {
  }

}
