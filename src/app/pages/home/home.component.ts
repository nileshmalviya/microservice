import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { SLIDES } from './slides-mock';
import { ConnectedUserModel } from '../../interfaces/user-model';
import { AccountService } from '../../services/account.service';
import { RafflesModalService } from '../../services/raffles-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';
import { SpeedTestService } from 'ng-speed-test';
import { AppConfig } from 'src/app/services/app.config';
import { MainService } from 'src/app/services/main.service';
// import { WinningService } from 'src/app/services/winning.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`)

  public coverSlides = SLIDES;
  public WifiSpeed;
  public displaytext2:string="none";
  public ShowVideoImg:boolean=false;
  public ImageShow:string;
  public VideoShow:string;
  public displaytext:string;
  public speedForWifi;
  public wifispeedtest:number;
  public videoSectionclass:string;
  public homepageCoverSlider: SwiperConfigInterface = {
    slidesPerView: 1,
    direction: 'vertical',
    allowTouchMove: false,
    watchOverflow: true,
    autoplay: {
      delay: 50,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  };

  public connectedUser:boolean;
  public userLength:number = 0;
  public currentUser: ConnectedUserModel;

  @ViewChild('raffles') rafflesRef: ElementRef;
  @ViewChild('raffles1') raffles1: ElementRef;
  constructor(
    public accountService: AccountService,
    private route: ActivatedRoute,
    private speedTestService:SpeedTestService,
    private modalService: RafflesModalService,
    private toastr: ToastrService,
    private mainService : MainService,
    private router:Router
      ) {
      
        
  }

  ngOnInit(): void {
    this.WifiSpeed=AppConfig.settings.internetspeed;
    this.isWifiConneted();
    //this.initUser()
    // if(this.currentUser==null){
    //   console.log("in false")
    //  this.connectedUser==false
    // }else{
    //   console.log("in true")
    //   this.connectedUser==true
    // }
    // this.currentUser = this.accountService.getConnectedUserSync();
    // this.userLength = Object.keys(this.currentUser).length;
    // console.log('userrlength',this.userLength);
    this.getVaue()
    // setTimeout(() => {
    //   this.scroll();
    // }, 600);
  }
 
  getVaue(){
            // this.modalService.openCongratulationsModal({});
            // this.modalService.RafflePaymentModel();
            // this.modalService.openPaymentFailedModal();
            // this.modalService.openResetPasswordModal(params.email,params.resetCode);


    this.route.queryParams.subscribe(params => {
      console.log("ssfdas", this.route.queryParams);

    if(params.resetPassword){
        this.accountService.checkRestPassword(params.userId).subscribe(data=>{
          if (data.result && data.data) {
            this.modalService.openResetPasswordModal(params.email,params.resetCode);
            this.router.navigate(['\ResetPassword']);
          }else{
            this.toastr.error(this.accountService.getKeyValue('toastr_invalid_link_please_requset_again'));
          }
        })
      }
      else if(params.signIn){
        this.modalService.openLoginModal();
      }
      else if(params.isActive){
        console.log("%%%%%%%%%%%%%%%");
        this.rafflescroll();
      }
      else if(params.validateUser){
        this.validateUser(params.userId);
      }

    })
  }
  public rafflescroll() {
    // this.raffles1.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    let rafflescroll = document.getElementById("rafflescroll");
    rafflescroll.style.marginTop = '-50px';
    setTimeout(() => {
      this.scroll();
    }, 200);
  }
  public scroll(): void {
    this.rafflesRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public login(): void {
    this.modalService.openLoginModal();
  }

  public register(): void {
    this.modalService.openRegisterModal();
  }
  private initUser(): void {

    this.currentUser = this.accountService.getConnectedUserSync();
    console.log("----this.currentUser---->", this.currentUser);
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
      this.currentUser = connectedUser;


    });


  }

  private validateUser(userId:string)
  {
    this.accountService.ValidateUser({userId:userId}).subscribe((response)=>{
      if(response.data){
        this.toastr.success(this.accountService.getKeyValue('toastr_user_validated_sucessfully'));
      }
    })
  }

  private isWifiConneted()
  {
        this.mainService.isWificonnected().subscribe((speed)=>{
      if(speed < AppConfig.settings.internetspeed){
        this.videoSectionclass='';
        this.VideoShow="none";
        this.ImageShow="block";
        this.displaytext="none"
        this.ShowVideoImg=false;
        console.log("imgage" );
      }else{
 
       this.videoSectionclass='video-section';
       this.ImageShow="none";
       this.VideoShow="block";
       this.ShowVideoImg=true;
       console.log("video");
       if(window.screen.width<500){
        setTimeout(() => {
          this.displaytext="none" 
          this.displaytext2="block"
        },1000)
       }
       else if(window.screen.width<900 && window.screen.width>500){
        setTimeout(() => {
          this.displaytext="none" 
          this.displaytext2="block"
        },1000)
       }
       else{
        setTimeout(() => {
          this.displaytext="block" 
        },200)
       }
     }
    });
}
}

