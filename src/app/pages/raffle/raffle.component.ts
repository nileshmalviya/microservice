import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { ActivatedRoute, Router } from '@angular/router';
import { RaffleFullModel } from '../../interfaces/raffle';
import { finalize } from 'rxjs/operators';
import { ServerResponse } from '../../interfaces/server-response';
import { MainService } from '../../services/main.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {RafflesModalService} from '../../services/raffles-modal.service';
import {AccountService} from '../../services/account.service';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {HomeDataModel, RafflePackageModel, RafflePaymentModel} from '../../interfaces/data-models';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { Toast, ToastrService } from 'ngx-toastr';
import { PixelService } from 'ngx-pixel';

@Component({
  selector: 'app-raffle',
  templateUrl: './raffle.component.html'
})
export class RaffleComponent implements OnInit {

  //////////////////////////////////////////
  // Big Deal Slider
  //////////////////////////////////////////
  public bigDealSlider: SwiperConfigInterface = {
    slidesPerView: 1.45,
    centeredSlides: true,
    watchOverflow: true,
    centerInsufficientSlides: true,
    // autoplay: {
    //   delay: 5000,
    // },
    // Responsive breakpoints
    breakpoints: {
      768: {
        slidesPerView: 2.3
      },
      1280: {
        slidesPerView: 4,
        centeredSlides: false,
      }
    }
  };

  @ViewChild('raffles') rafflesRef: ElementRef;
  public isLoading = true;
  public purchaseLoader = false;

  public raffleId: string;
  public raffle: RaffleFullModel;
  public  productImageObject = [];
  public connectedUser: ConnectedUserModel;

  private homeData: HomeDataModel;

  public raffleCurrentPayment:any;
  rafflePackagePrice: any;
  selectedLanguage:string = "";

  public sliderHeight = {
    width : '100%',
    height : '100%'
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mainService: MainService,
    private accountService: AccountService,
    private modalService: RafflesModalService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private pixel: PixelService
  ) {
    this.mainService.raffleStatus.on('updateTickets',() =>{
      this.updateRaffleTicket();
    });
    this.dynamicStyleToArrow();
    this.mainService.currentMessage.subscribe((message) => {
      if (message === '0') {
        this.ngOnInit();
        this.mainService.messageSource.next("1");
      }
    });
  }

  ngOnInit(): void {
    this.hostSize();
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.homeData = this.mainService.getHomeDataSync();
    this.initRaffle();
    this.connectedUser = this.accountService.getConnectedUserSync();
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
       this.connectedUser = connectedUser;
       console.log("hey calleed",this.connectedUser)
    });
  }

  public finishedHandler(event){
    this.router.navigateByUrl('/home');
  }
  
  private initRaffle(): void {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.raffleId = params.id;
        this.getRaffle();
      }
    });
  }

  private getRaffle(): void {
    this.isLoading = true;
    this.mainService.getRaffle(this.raffleId)
        .pipe(finalize(() => {
          this.isLoading = false;
        }))
        .subscribe((resp: ServerResponse<RaffleFullModel>) => {
          if (!resp.data) {
            this.router.navigateByUrl('/home');
            return;
          }

          this.raffle = resp.data;
          var current = new Date();
          var diff  = new Date();
          diff.setSeconds(diff.getSeconds() + this.raffle.timedifference);
          this.raffle.raffleDate = TwoRaffleHelpers.convertUTCtoLocal(diff);
          var r = new Date(this.raffle.raffleDateTime);
          
          var diffInHours = this.raffle.timedifference/(60*60);
          this.raffle.hideDay = diffInHours<=23.99;
          if(this.raffle.productImageUrl[0] === 'no image'){
            this.raffle.productImageUrl[0] = 'assets/images/noImageAvailable.png';
          } else{
            this.raffle.productImageUrl = this.raffle.productImageUrl;
          }
          this.raffleProductImage();
          var pckList = this.mainService.getRafflePackages();
          this.raffle.rafflePackages = pckList;
          // Fix HTMLs.
          this.raffle.safeProductLegalNotes = this.sanitizer.bypassSecurityTrustHtml(this.raffle.productLegalNotes);
          this.raffle.safeProductDescription = this.sanitizer.bypassSecurityTrustHtml(this.raffle.productDescription);
      });
  }

  public getCurrency(): string {
    return this.homeData.currency.mark;
  }

  buyTickets(rafflePackage: RafflePackageModel): void {
    console.log(JSON.stringify(rafflePackage.price))
    console.log("heyy buy ticktes",this.modalService.raffleCurrentPayment)
    //if(this.connectedUser != null || this.connectedUser != undefined){
      //this.accountService.IsUserBlock(this.connectedUser.id).subscribe(response => {
  
       //if(response.data){
       /// this.accountService.userBlockEvent.emit(response.data);
       //}else{
         this.mainService.getRaffle(this.raffleId).subscribe((res) =>{
           if(res.data.availableTickets >= rafflePackage.ticketsNumber){
              this.openPaymentForm(rafflePackage);
              let obj=[{
                'packageName':rafflePackage.name,
                'packagePrice':rafflePackage.price
              }]
              this.pixel.trackCustom('Payment Page', {
                content_name:'Payment page',
                contents: obj,
                status:true
              });
           }else{
            this.toastr.info(this.accountService.getKeyValue('toastr_out_of_stock'))
           }
        // });
       //}
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
      })
    // }else{
    //   this.accountService.isPaymentCall = true;
    //   let modalRef =  this.modalService.openRegisterModal();
    //   this.pixel.trackCustom('RegisterView', {
    //     content_name:'RegisterView',
    //     status:true
    //   });
    // }
  }

  openPaymentForm(rafflePackage) {
    var current = new Date();
    var rData = new Date(this.raffle.raffleDateTime);
    var offset = TwoRaffleHelpers.getUTCTimeDifference();
    //var d = new Date(ele.purchaseDate);
    if(offset[0] == 'p'){
        rData.setHours(rData.getHours() + parseInt(offset.substring(1).split(":")[0]));
        rData.setMinutes(rData.getMinutes() + parseInt(offset.substring(1).split(":")[1]));
    }else {
        rData.setHours(rData.getHours() - parseInt(offset.substring(1).split(":")[0]));
        rData.setMinutes(rData.getMinutes() - parseInt(offset.substring(1).split(":")[1]));
    }
    //current.setHours(rData.getHours(), rData.getMinutes(),rData.getSeconds(),rData.getMilliseconds());
    if(rData<current) {
      this.toastr.error(this.accountService.getKeyValue('toastr_raffle_time_out'));
      return;
    }

      //this.mainService.isUserVerified(this.connectedUser.id).subscribe((response)=>{
        //if(response.result){
          // console.log("is verified::::",response);
           //if(response.data){
              //this.scroll();
              this.accountService.userVerified = true;
              console.log(this.raffle,rafflePackage);
              let modelRef = this.modalService.openPaymentModal(this.raffle, rafflePackage);
              var data = new RafflePaymentModel();
              data.raffleId = this.raffle.raffleId;
              data.ticketsCount = rafflePackage.ticketsNumber;
              if(this.connectedUser!=null){
                data.userId = this.connectedUser.id;
              }
             
            /*} else {
              // this.modalService.openUserNotVerifiedModal();
              this.accountService.isPaymentCall = true;
              this.modalService.openOtpVarifyModal().closed.subscribe((res) =>{
                if(res){
                  let modelRef = this.modalService.openPaymentModal(this.raffle, rafflePackage);
                }
              });
            }*/
        //}
      // }, (error) =>{

      // });
  }

//   public scroll(): void {
//     if (!this.connectedUser) {
//     this.modalService.openRegisterModal();
//   } else {
//     this.rafflesRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
//   }
//  }
public scroll(): void {
  this.rafflesRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
}

 public raffleProductImage() {
  console.log("this.raffle?.productImageUrl ",this.raffle?.productImageUrl)
  for(const val of this.raffle?.productImageUrl){
    this.productImageObject.push({
        image: val,
        thumbImage: val,
      });
  }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.sliderHeight = {
      width : '100%',
      height: (window.innerWidth / 1.5 )+''
    }
  }
  public hostSize(){
    this.sliderHeight = {
      width : '100%',
      height: (window.innerWidth / 1.5 )+''
    }
  }
  public async updateRaffleTicket(){
      this.mainService.getRaffle(this.raffleId).subscribe(res =>{
        this.raffle.availableTickets = res.data.availableTickets;
      });
  }

  public dynamicStyleToArrow(){
    setTimeout(() =>{
      let prevArrow:any = document.getElementsByClassName('prev icons prev-icon');
      for (let i = 0; i < prevArrow.length; i++) {
       prevArrow[i].innerHTML = "<video autoplay playsinline  muted loop='true' id='playpausePrev' class='video_for'><source src='assets/video/arrow-pre.mp4' type='video/mp4'></video>";
      }
      let bextArrow:any = document.getElementsByClassName('next icons next-icon');
      for (let i = 0; i < bextArrow.length; i++) {  
      
        bextArrow[i].innerHTML =  "<video autoplay playsinline  muted loop='true' id='playpauseNext' class='video_for'><source src='assets/video/Arrow_next.mp4' type='video/mp4' ></video>";
     }
      const elementPrevArrow = document.querySelector(".prev-icon");
      var prevArrowId:any=document.getElementById('playpausePrev')
        prevArrowId.pause(); // default pause
       elementPrevArrow.addEventListener('mouseleave', () => {
       prevArrowId.pause();
       prevArrowId.currentTime = 0;
      });
      elementPrevArrow.addEventListener('mouseenter', () => {
       prevArrowId.play();
      });

      const elementNextArrow = document.querySelector(".next-icon");
      var nextArrowId:any=document.getElementById('playpauseNext')
      nextArrowId.pause(); // default pause
       elementNextArrow.addEventListener('mouseleave', () => {
        nextArrowId.pause();
        nextArrowId.currentTime = 0;
      });
      elementNextArrow.addEventListener('mouseenter', () => {
        nextArrowId.play();
      });
    },1000)

  }

}




