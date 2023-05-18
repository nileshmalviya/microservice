import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {SLIDES} from './slides-mock';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {AccountService} from '../../services/account.service';
import {RafflesModalService} from '../../services/raffles-modal.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  public coverSlides = SLIDES;

  public homepageCoverSlider: SwiperConfigInterface = {
    slidesPerView: 1,
    direction: 'vertical',
    allowTouchMove: false,
    watchOverflow: true,
    // autoplay: {
    //   delay: 5000,
    // },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  };

  public connectedUser: ConnectedUserModel;

  @ViewChild('raffles') rafflesRef: ElementRef;

  constructor(private accountService: AccountService,
              private modalService: RafflesModalService) {
  }

  ngOnInit(): void {
    this.connectedUser = this.accountService.getConnectedUserSync();
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
      this.connectedUser = connectedUser;
    });
  }

  public scroll(): void {
    this.rafflesRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  public login(): void {
    this.modalService.openLoginModal();
  }

  public register(): void {
    this.modalService.openRegisterModal();
  }
}
