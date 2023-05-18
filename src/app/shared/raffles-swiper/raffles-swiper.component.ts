import {
  Component,
  ComponentRef,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { RaffleShortModel } from '../../interfaces/raffle';
import { MainService } from '../../services/main.service';
import TwoRaffleHelpers from '../../helpers/helpers';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PixelModule, PixelService } from 'ngx-pixel';

@Component({
  selector: 'app-raffles-swiper',
  templateUrl: './raffles-swiper.component.html',
})
export class RafflesSwiperComponent implements OnInit {
  public raffles: RaffleShortModel[];
  componentRef!: ComponentRef<RafflesSwiperComponent>;
  public ourRafflesSlider: SwiperConfigInterface = {
    slidesPerView: 1.45,
    centeredSlides: true,
    //watchOverflow: true,
    //loop: window.screen.height <= 1180,
    loop: true,
    // autoplay: {
    //   delay: 5000,
    // },
    // Responsive breakpoints
    breakpoints: {
      768: {
        slidesPerView: 1.82,
      },
      1180: {
        slidesPerView: 2,
        centeredSlides: false,
      },
      1440: {
        slidesPerView: 3,
        centeredSlides: false,
      },
      1920: {
        slidesPerView: 4,
        centeredSlides: false,
      },
    },
    navigation: {
      nextEl: '.raffles-button-next',
      prevEl: '.raffles-button-prev',
    },
  };

  constructor(private service: MainService, private route: ActivatedRoute,private pixel: PixelService) {
    this.service.currentMessage.subscribe((message) => {
      if (message === '0') {
        this.ngOnInit();
        this.service.messageSource.next("1");
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getRaffles();
    });
  }

  public finishedHandler(event: any): void {
    console.log(event);

    this.ngOnInit();
  }

  private async getRaffles(): Promise<void> {
    this.raffles = [];
    await this.service
      .getHomeData(true)
      .pipe()
      .subscribe((resp: any) => {
        resp.raffles.forEach((ele) => {
          var d = new RaffleShortModel();
          d.outOfTickets = ele.outOfTickets;
          if (ele.productImageUrl[0].includes('no image')) {
            d.productImageUrl[0] = 'assets/images/noImageAvailable.png';
          } else {
            d.productImageUrl = ele.productImageUrl;
          }
          d.raffleName = ele.raffleName;
          //d.raffleDate = ele.raffleDate;
          var diff  = new Date();
          diff.setSeconds(diff.getSeconds() + ele.timedifference);
          d.raffleDate = TwoRaffleHelpers.convertUTCtoLocal(diff);
          d.ticketPrice = ele.ticketPrice;
          d.uniqueId = ele.uniqueId;
          var diffInHours = ele.differenceHours;
          d.hideDay = diffInHours <= 23.99;
          this.raffles.push(d);
        });
        console.log(this.raffles);
      });
  }
  
  public raffleClickEvent(id): void {
    let obj=[{
      'raffleId':id,
    }]
    this.pixel.trackCustom('RafflePage', {
      status:true,
      contents:obj
    });
  } 
}
