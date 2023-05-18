import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {RafflesModalService} from '../../services/raffles-modal.service';
import { MarketingCampaignModel } from 'src/app/interfaces/data-models';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { MainService } from 'src/app/services/main.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { response } from 'express';
import { PixelService } from 'ngx-pixel';
import { AppConfig } from 'src/app/services/app.config';

@Component({
    selector: 'app-sign-up-modal',
    templateUrl: './sign-up-modal.component.html',
})
export class SignUpModalComponent implements OnInit {
  @ViewChild('regisRef') loginElement!: ElementRef;
    public passwordStrengthRegex: RegExp;
    public campaignModel = new MarketingCampaignModel();

    public loading: boolean;
    public rememberMe = false;
    public isAdult = true;
    public showPassword = false;
    public raffleUrl: string = "";
    public ShowVideoImg:boolean=false;
    public previousUrl:string;
    // Form fields
    public email: string;
    public password: string;
    public wrongCredentials: boolean;
    public requiredEmail:boolean=true;
    userExistsErrors: boolean = false;
    userExistsErrorsMsg: string;
    private selectedLanguage :string;
    auth2: any;

    constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal,
                public modalService: RafflesModalService,
                private mainService : MainService,
                private socialAuthService: SocialAuthService,private mainServic: MainService,private jwtHelper :JwtHelperService,private route:ActivatedRoute,
                private toastr: ToastrService,private pixel: PixelService) {
    }


    ngOnInit(): void {
      this.previousUrl= this.router.url;
      this.googleAuthSDK();
      if(this.accountService.getConnectedUserSync()==null){
        this.router.navigate(['/SignUp']);
      }
      
      this.isWifiConneted();
        this.passwordStrengthRegex = this.accountService.passwordStrengthRegex;
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.accountService
            .getConnectedUser()
            .subscribe((user: ConnectedUserModel) => {
                if (user != null) {
                    this.router.navigate(['/home']);
                }
            });

            this.raffleUrl = window.location.href.split("/")[3];
    }



    public register(f: NgForm): void {
        if (f.invalid) {
            TwoRaffleHelpers.markFormInvalidAndFocus(f);

            return;
        } else if (!this.isAdult) {
            // TODO: Better solution for this one.
            alert('You must be old enough in order to register.');
            return;
        }
        this.pixel.trackCustom('InitiateRegister', {
          content_name:'InitiateRegister',
          status:true
        });
        this.wrongCredentials = false;
        this.loading = true;
        f.form.disable();
        
        this.accountService
            .register(this.email, this.password, this.rememberMe,this.selectedLanguage)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    f.form.enable();
                })
            )
            .subscribe((response: ServerResponse<ConnectedUserModel>) => {
                if (response.result) {
                  let obj=[{
                    'Name':response.data.fullName,
                    'Id':response.data.id,
                    'Email':response.data.email
                  }]
                    this.pixel.trackCustom('RegisterSuccessfully', {
                      content_name:'RegisterSuccessfully',
                      content:obj,
                      status:true
                    });
                    localStorage.setItem("currentUSer",JSON.stringify(response.data));
                    sessionStorage.setItem("token",response.data.tokenResult);
                    this.accountService.updateConnectedUser(response.data);
                    this.saveCampionDetails(response.data.id);
                    this.activeModal.close();
                    
                    
                    if(this.previousUrl=="/SignIn"){
                        this.router.navigate([localStorage.getItem("lastprivious").toString()])
                    }
                    else{
                      this.router.navigate([this.previousUrl]);
                    }
                    this.modalService.openOtpVarifyModal().closed.subscribe((res) => {
                      if(res){
                        this.openPaymentWindow(response.data.id);
                      }
                    });
                    this.accountService.getProfileImageOfUser()
                } else {
                    console.error(response.error, response.result);
                    if(response.error =='User Already Exists !!'){
                      this.userExistsErrors=true
                      this.userExistsErrorsMsg="User is Already Exists !!"     
                    }else if(response.error == 'User not belongs to Maxico !!'){
                      // this.toastr.error('User not belongs to Maxico !!');
                      this.toastr.error(this.accountService.getKeyValue('toastr_User_not_belongs_to_Maxico!!'));
                    }
                    this.wrongCredentials = false;
                    this.pixel.trackCustom(response.error, {
                      content_name:response.error,
                      content:response.error,
                      status:true
                    });
                }
            });
    }




    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    private saveCampionDetails(userId:number){
        if(window.location.href.includes('campaignId'))
        {
          var isWinner, isSignUp, isPurchase, isReset = false;
            this.route.queryParams.subscribe((pa)=>{
                var keys = Object.keys(pa);
                if(pa.winnerPage){ isWinner = true;}
                if(pa.resetPassword){ isReset = true;}
                if(pa.validateUser){ isSignUp = true;}
                keys.forEach((ele,i)=>{
                    switch(ele.toLowerCase()){
                    case "source" : this.campaignModel.source = pa[ele]; break;
                    case "raffleid" : this.campaignModel.raffleId = pa[ele]; break;
                    case "campaignid" : this.campaignModel.campaignId = pa[ele]; break;
                    case "clickid" : this.campaignModel.clickId = pa[ele]; break;
                    case "fullurlcampaign" : this.campaignModel.fullUrl = pa[ele]; break;
                    case "dyn1" : this.campaignModel.dyn1 = pa[ele]; break;
                    case "dyn2" : this.campaignModel.dyn2 = pa[ele]; break;
                    case "dyn3" : this.campaignModel.dyn3 = pa[ele]; break;
                    case "dyn4" : this.campaignModel.dyn4 = pa[ele]; break;
                    case "dyn5" : this.campaignModel.dyn5 = pa[ele]; break;
                    default: this.campaignModel = new MarketingCampaignModel(); break;
                    }
                })
            })
            if((this.campaignModel != undefined || this.campaignModel != null) && !isWinner && !isReset && !isSignUp){
                this.campaignModel.userId = userId;
                this.campaignModel.fullUrl = window.location.href;
                this.accountService.saveMarketingCampaign(this.campaignModel).subscribe((res)=>{
                    if(res.result){
                        console.log("campagin save!!");
                    }
                })
            }
        }
    }

  callLogin() {
      this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
        (googleAuthUser: any) => {
          //Print profile details in the console logs
          let profile = googleAuthUser.getBasicProfile();
          const myArray = profile.getName().split(" ");
          const firstname=myArray[0];
          const lastName= myArray[1];
        this.accountService.socialLogin(profile.getEmail(), firstname,lastName, "", true, profile.getImageUrl(), this.selectedLanguage).pipe(
          finalize(() => {
                      this.loading = false;
                    })
                  )
                  .subscribe((response: ServerResponse<ConnectedUserModel>) => {
                    if (response.result) {
                      this.router.navigate(['/home']);
                     localStorage.setItem("currentUSer",JSON.stringify(response.data));
                     sessionStorage.setItem("token", response.data.tokenResult);
                      this.accountService.updateConnectedUser(response.data);
                      this.saveCampionDetails(response.data.id);
                      this.activeModal.close();
                      this.openPaymentWindow(response.data.id);
                      this.accountService.getProfileImageOfUser()
                    }else{
                      this.pixel.trackCustom('RegisterFailed', {
                        content_name:'RegisterFailed',
                        contents:response.error,
                        status:true
                       });
                      if(response.error == 'User not belongs to Maxico !!'){
                        this.toastr.error(this.accountService.getKeyValue('toastr_User_not_belongs_to_Maxico!!'));
                      }
                    }
                  });
                });
    }


  googleAuthSDK() {
      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement('script');
        js.id = id;
        js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
        fjs?.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'google-jssdk'));
      (<any>window)['googleSDKLoaded'] = () => {
        (<any>window)['gapi'].load('auth2', () => {
          this.auth2 = (<any>window)['gapi'].auth2.init({
            client_id: '702125030129-ov8fqdf1murl94qe1nv6m6iu9svnc1bs.apps.googleusercontent.com',
            plugin_name: 'login',
            cookiepolicy: 'single_host_origin',
            scope: 'profile email'
          });
            this.callLogin();
        });
      }
}

// loginWithGoogle(): void {
    //     this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x: any) => {
    //       this.accountService.socialLogin(x.email, x.firstName, x.lastName, "", true,x.photoUrl, this.selectedLanguage).pipe(
    //         finalize(() => {
    //           this.loading = false;
    //         })
    //       )
    //       .subscribe((response: ServerResponse<ConnectedUserModel>) => {
    //         if (response.result) {
    //           this.router.navigate(['/home']);
    //          localStorage.setItem("currentUSer",JSON.stringify(response.data));
    //          sessionStorage.setItem("token", response.data.tokenResult);
    //           this.accountService.updateConnectedUser(response.data);
    //           this.saveCampionDetails(response.data.id);
    //           this.activeModal.close();
    //           this.openPaymentWindow(response.data.id);
    //           this.accountService.getProfileImageOfUser()
    //         }else{
    //           this.pixel.trackCustom('RegisterFailed', {
    //             content_name:'RegisterFailed',
    //             contents:response.error,
    //             status:true
    //            });
    //           if(response.error == 'User not belongs to Maxico !!'){
    //             this.toastr.error(this.accountService.getKeyValue('toastr_User_not_belongs_to_Maxico!!'));
    //           }
    //         }
    //       });
    //     });
    //   }

      facebookSignin(): void {
        this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((x: any) => {
          console.log(JSON.stringify(x));
          this.accountService.socialLogin(x.email, x.firstName, x.lastName, "",true,x.photoUrl,this.selectedLanguage).pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe((response: ServerResponse<ConnectedUserModel>) => {
            if (response.result) {
              let obj=[{
                'Name':response.data.fullName,
                'Id':response.data.id,
                'Email':response.data.email
              }]
                this.pixel.trackCustom('RegisterSuccessfully', {
                  content_name:'RegisterSuccessfully',
                  content:obj,
                  status:true
                });
                this.router.navigate(['/home']);
              localStorage.setItem("currentUSer",JSON.stringify(response.data));
              sessionStorage.setItem("token", response.data.tokenResult);
              this.accountService.updateConnectedUser(response.data);
              this.saveCampionDetails(response.data.id);
              this.activeModal.close();
              this.openPaymentWindow(response.data.id);
              this.accountService.getProfileImageOfUser()
            }else{
              this.pixel.trackCustom('RegisterFailed', {
                content_name:'RegisterFailed',
                contents:response.error,
                status:true
               });
              if(response.error == 'User not belongs to Maxico !!'){
                this.toastr.error(this.accountService.getKeyValue('toastr_User_not_belongs_to_Maxico!!'));
              }
            }
          });
        });
      }

      appleSignin() : void {
        window['AppleID'].auth.signIn().then((res) => {
          console.log("apple login response:: ",res);
          var decode = this.jwtHelper.decodeToken(res.authorization.id_token);
          var email = decode.email;
         // console.log("apple login email...."+email);
          this.accountService.socialLogin(email, "", "", "",true,"",this.selectedLanguage).pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe((response: ServerResponse<ConnectedUserModel>) => {
            if (response.result) {
              let obj=[{
                'Name':response.data.fullName,
                'Id':response.data.id,
                'Email':response.data.email
              }]
                this.pixel.trackCustom('RegisterSuccessfully', {
                  content_name:'RegisterSuccessfully',
                  content:obj,
                  status:true
                });
                this.router.navigate(['/home']);
              localStorage.setItem("currentUSer",JSON.stringify(response.data));
              sessionStorage.setItem("token", response.data.tokenResult);
              this.accountService.updateConnectedUser(response.data);
              this.activeModal.close();
              this.openPaymentWindow(response.data.id);
              this.accountService.getProfileImageOfUser()
            }else{
                this.pixel.trackCustom('RegisterFailed', {
                  content_name:'RegisterFailed',
                  contents:response.error,
                  status:true
                 });
              if(response.error == 'User not belongs to Maxico !!'){
                this.toastr.error(this.accountService.getKeyValue('toastr_User_not_belongs_to_Maxico!!'));
              }
            }
          });
        });
      }
public isEmailValid1:boolean=false;
  validateEmail1 (email) {
    this.requiredEmail=false;
    let isValid =  String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      console.log("-------",isValid);
      if(isValid != null){
        this.isEmailValid1 = false;
      }
      else{
        this.isEmailValid1 = true;
      }
  };
  public closeSignupPopUp(){
    this.modalService.openLoginModal().closed.subscribe((response) =>{
      this.openPaymentWindow(response);
    });
  }
  public openPaymentWindow(data:any){
    if(this.accountService.isPaymentCall){
      if(data != undefined || data != null){
        this.mainServic.isUserVerified(data).subscribe((res) =>{
          if(res.result){
            if(res.data){
              if(this.raffleUrl == "raffle" && this.accountService.isPaymentCall){
                setTimeout(() => {
                  let modelRef = this.modalService.openPaymentModal(this.modalService.raffleModalData, this.modalService.raffleCurrentPayment);
                },500)
              }
            }else{
              this.modalService.openOtpVarifyModal();
            }
          }
        });
      }
    }
  }

  private isWifiConneted()
  {
      this.mainService.isWificonnected().subscribe((speed)=>{
       if(speed < AppConfig.settings.internetspeed){
         this.ShowVideoImg=false;
       }else{
         this.ShowVideoImg=true;
       }
     });
 }
  public activemodalclose1(){
    this.activeModal.dismiss('Cross click');
    if(this.previousUrl=="/SignIn" && window.location.href.includes("/ForgotPassword")){
      this.router.navigate([localStorage.getItem("lastprivious").toString()])
  }
  else if(this.previousUrl=="/home?isActive=true"){
    this.router.navigate(['/home']);
  }
  else{
    this.router.navigate([this.previousUrl]);
  }
}
  
}


