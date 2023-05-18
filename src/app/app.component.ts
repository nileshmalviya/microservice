import { Component, OnInit,HostListener } from '@angular/core';
import * as AOS from 'aos';
import { finalize } from 'rxjs/operators';
import { MainService } from './services/main.service';
import { TranslationService } from './services/translation.service';
import { AccountService } from './services/account.service';
import { ActivatedRoute } from "@angular/router";
import { RafflesModalService } from "./services/raffles-modal.service";
import { NewPasswordModalComponent } from "./modals/new-password-modal/new-password-modal.component";
import TwoRaffleHelpers from './helpers/helpers';
import { WinningService } from './services/winning.service';
import { ToastrService } from 'ngx-toastr';
import { SignalRService } from './services/signal-r.service';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from './services/app.config';
import { RafflePackageModel } from './interfaces/data-models';

declare let fbq:Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'TwoRaffleClient';
  public isMenuCollapsed = true;
  public data: any;
  public loading: boolean = false;
  public isLoadingUser: boolean = false;
  public userLoggedIn: any;
  public ForHideShowCookiemodal:boolean=false;
  public isBlockNone:string="";
  public fordropdownValue:string="";
  public seletedpakage :RafflePackageModel ;
  public selectedLanguageGlobal:string;
  public RafflePackageModel: RafflePackageModel; 
  constructor(
    private activatedRoute: ActivatedRoute,
    private mainService: MainService,
    private translate: TranslationService,
    private accountService: AccountService,
    private modalService: RafflesModalService,
    private route: ActivatedRoute,
    private winningService: WinningService,
    private toastr: ToastrService,
    public signalRService: SignalRService,
    private http: HttpClient,
    private router:Router
  ) {
    this.initUser();
    // When user navigate any page in application. below code call fbq() function with current page name
    this.router.events.subscribe((res:NavigationEnd) =>{
      this.urlChange();
      if(res instanceof NavigationEnd){
        fbq('track', 'PageView');
      }
    });
  }

  ngOnInit(): void {
    this.checkUrlOpenModal();
   this.selectedLanguageGlobal= AppConfig.settings.selectedlanguage;
    this.ForHideShowCookiemodal=true;
    var getExistingUrl= this.getExistingUrl()
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    if(localStorage.getItem('token')){
      sessionStorage.setItem('token', localStorage.getItem('token'));
    }
   if((selectedLanguage==null)||(this.selectedLanguageGlobal!=null && this.selectedLanguageGlobal!=undefined && this.selectedLanguageGlobal!="")){
    this.selectedLanguageGlobal = this.selectedLanguageGlobal.includes("en")?"en-US":"es-ES";
    localStorage.setItem("selectedLanguage", this.selectedLanguageGlobal==null||undefined|| ""? "es-ES":this.selectedLanguageGlobal);
   }
         
    this.AOSinit();
    this.getData();
    this.signalRService.startConnection();
    this.signalRService.addTransferChartDataListener();
    this.signalRService.addBroadcastChartDataListener();
    this.startHttpRequest();
    // If we have reset password, show it. Otherwise, get the connected user.
    this.activatedRoute.queryParams.subscribe(params => {
      const resetCode = params.resetCode;
      const resetPassword = params.resetPassword;
      const email = params.email;

      // if ((resetPassword || resetCode) && email) {
      //     // TODO: Should we check if it's still valid?
      //     const modal = this.modalsService.openResetPasswordModal(email,resetCode);
      //     const modalInstance = (modal.componentInstance as NewPasswordModalComponent);

      //     // Set the parameters inside the popup.
      //     modalInstance.code = resetCode;
      //     modalInstance.email = email;
      // } else {
      //     this.initUser();
      // }
    });
    if(this.ForHideShowCookiemodal==true && !getExistingUrl){
      if(window.location.href.includes("/"||"campaignId")){
             this.isBlockNone="block"; 
     }
      else{
             this.isBlockNone="none";
          }
    }
    else
    {
      this.isBlockNone="none";
    }
  }

  private AOSinit(): void {
    AOS.init({
      // Global settings:
      disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
      startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
      initClassName: 'aos-init', // class applied after initialization
      animatedClassName: 'aos-animate', // class applied on animation
      useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
      disableMutationObserver: false, // disables automatic mutations' detections (advanced)
      debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
      throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)


      // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
      // offset: 100, // offset (in px) from the original trigger point
      // delay: 50, // values from 0 to 3000, with step 50ms
      // duration: 1000, // values from 0 to 3000, with step 50ms
      // easing: 'ease-in-out', // default easing for AOS animations
      // once: false, // whether animation should happen only once - while scrolling down
      // mirror: true, // whether elements should animate out while scrolling past them
      // anchorPlacement: 'top-center', // defines which position of the element regarding to window should trigger the animation

    });
  }

  public toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  public collapseMenu(): void {
    this.isMenuCollapsed = true;
  }

  private getData(): void {
    this.loading = true;
    this.mainService.getHomeData().pipe(finalize(() => {
      this.loading = false;
    })).subscribe((resp) => {
      resp.raffles.forEach((ele) => {
        ele.raffleDate = TwoRaffleHelpers.convertUTCtoLocal(ele.raffleDateTime);
      })
      this.data = resp;
      if (this.data.languages && this.data.languages.length) {
        this.setupLanguage(this.data.languages);
      }
    });
  }

  // Language setup to use the languages from response data
  private setupLanguage(langs: Array<any>): void {
    this.translate.setupLanguage(langs);
  }

  private initUser(): void {
    this.isLoadingUser = true;
    this.accountService.getConnectedUser(true).subscribe((data: any) => {
      if (data) {
        this.userLoggedIn = data;
      }
      this.isLoadingUser = false;
      this.winningLink()
    });

  }
  private startHttpRequest = () => {
    this.http.get(this.accountService.getServerUrl('Socket'))
      .subscribe(res => {
        console.log(res);
        console.log("21345678908765432");
      })
  }

  winningLink() {
    this.route.queryParams.subscribe(params => {
      if (params.winnerPage && !this.userLoggedIn) {
        this.modalService.openLoginModal();
      } else if (params.winnerPage) {
        this.winningService.checkUserIsWinner(params.winnerId, this.userLoggedIn['id'],params.winningTicketId).subscribe(data => {
          if (data.result && data.data=="Not Claimed") {
            this.modalService.openCongratulationsModal(params);
          }
          else if(data.result && data.data=="Claimed"){
            this.toastr.info(this.accountService.getKeyValue('toastr_Reward_Already_Collected'));
          }
          else if(data.result && data.data=="Different User"){
            this.toastr.error(this.accountService.getKeyValue('toastr_invalid_user_details'));
          }
        })
      }
    })
  }
  private getExistingUrl():boolean{
    var isExistCampainurl=window.location.href.includes("campaignId");
    var key = false;
    var isExists = document.cookie.indexOf('fullurl=');
    var isExistsforcompain = document.cookie.indexOf('campaignid=');
    if(isExists != -1 || isExistsforcompain!=-1){
      if(window.location.href.includes("campaignId"))
      {
        if(isExistsforcompain!=-1)
        {
          return true;
        }
          return false
      }
      key=true
    }
  return key;
  }

  
  public onsubmitData(isBlockNone){

    if(isBlockNone){
      var existingUrl = this.getExistingUrl();
      if(window.location.href.includes("/"||"campaignId")){
        if(!existingUrl){
        this.setCookie();
        } 
      }
    }else{
      this.isBlockNone="none"
    }
    this.isBlockNone="none"
  }

  private setCookie(){
    var expiryDateT = new Date();
    expiryDateT.setMonth(expiryDateT.getMonth() + 1 );
    var fullUrl = "fullurl";
    var fullurlcampaign = "fullurlcampaign";
    if(window.location.href.includes('/'|| "campaignId")){
      this.route.queryParams.subscribe((pa)=>{
        var keys = Object.keys(pa);
        keys.forEach((ele,i)=>{
          document.cookie = `${ele.toLowerCase()}=${pa[ele]}; expires=${expiryDateT}`;
        })
        document.cookie = `${fullUrl}=${window.location.href}; expires=${expiryDateT}`;
      })
      if(window.location.href.includes("campaignId")){
        document.cookie = `${fullurlcampaign}=${window.location.href}; expires=${expiryDateT}`;
      }
      
    }
   }
   @HostListener('click', ['$event.target'])
   onClick(btn){
    this.fordropdownValue="none";
   }
public urlChange(){
  if(this.router.url!="/SignIn" && !window.location.href.includes("SignUp") 
  && !window.location.href.includes("isActive=true") 
  && !window.location.href.includes("/ForgotPassword")
  && !window.location.href.includes("/OTP") 
  && !window.location.href.includes("/PaymentFailed")
  && !window.location.href.includes("/ResetPassword") 
  && !window.location.href.includes("resetPassword")
  && !window.location.href.includes("/paymets") 
  && !window.location.href.includes("/ResetPassword")
  && !window.location.href.includes("?resetPassword")
  && !window.location.href.includes("winnerPage")
  && !window.location.href.includes("Congratulations"))
  {
    localStorage.setItem("lastprivious",this.router.url);
  }
  
}
public checkUrlOpenModal(){
  if(window.location.href.includes("Thankyou")){
    this.router.navigate(['/home']);
   }
   if((window.location.href.includes("SignUp")) && localStorage.getItem("currentUSer")==null){
     this.modalService.openRegisterModal();
  }
  else if((window.location.href.includes("SignUp")) && localStorage.getItem("currentUSer")!=null){
    this.router.navigate(['/home']);
  }
  if((window.location.href.includes("SignIn")) && (localStorage.getItem("currentUSer")==null)){
    this.modalService.openLoginModal();
  }
  else if((window.location.href.includes("SignIn")) && localStorage.getItem("currentUSer")!=null){
  this.router.navigate(['/home']);
  }
  if(window.location.href.includes("ForgotPassword")){
    this.modalService.openForgotPasswordModal();
  }
  if(window.location.href.includes("/PaymentFailed")){
    this.router.navigate(['/home']);
  }
  if(window.location.href.includes("/ChangePassword") && localStorage.getItem("currentUSer")!=null ){
    var data = JSON.parse(localStorage.getItem("currentUSer"));
    this.modalService.openChangePasswordModal(data);
  }
  if(window.location.href.includes("/ChangePassword") && localStorage.getItem("currentUSer")==null ){
    this.router.navigate(['/home']);
  }
 
let data1=window.location.href.split('/');
if(data1[5]=="paymets"){
  this.mainService.getRaffle(data1[4]).subscribe((res) =>{
    if(res.data.timedifference>=0){
    if(res.data.raffleId!=0|| res.data.raffleId!=null){
      var pckList = this.mainService.getRafflePackages();
      var itemArray=[];
      pckList.map((item:RafflePackageModel)=>{
      itemArray.push(item);
      res.data.rafflePackages=itemArray;
      });
      pckList.map((item:RafflePackageModel)=>{
       if(item.ticketsNumber==parseInt(data1[6])){
       this.seletedpakage=item;
       }
       else{
        this.router.navigate(['/home']);
       } 
      });
      if(this.seletedpakage!=undefined ){
        this.modalService.openPaymentModal(res.data,this.seletedpakage); 
      }
}
      else{
        this.router.navigate(['/home']);
      }
    }
    else{
      this.toastr.error(this.accountService.getKeyValue('Raffle time is over'));
      this.router.navigate(['/home']);
      }
  });
}
else if(data1[4]=="paymets") {
  this.router.navigate(['/home']);
}
  if(window.location.href.includes("/OTP")  ){
    this.router.navigate(['/home']);
  }

} 

}

