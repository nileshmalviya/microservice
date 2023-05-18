import { Component, ElementRef, ViewChild, Injectable, OnInit, EventEmitter, Output } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ServerResponse } from '../../interfaces/server-response';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserModel } from '../../interfaces/user-model';
import TwoRaffleHelpers from '../../helpers/helpers';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RaffleFullModel } from '../../interfaces/raffle';
import { RafflesModalService } from '../../services/raffles-modal.service';
// import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { MarketingCampaignModel, RafflePaymentModel } from 'src/app/interfaces/data-models';
import { JwtHelperService } from '@auth0/angular-jwt';
import { WinningService } from 'src/app/services/winning.service';
import { MainService } from 'src/app/services/main.service';
import { ToastrService } from 'ngx-toastr';
import { PixelService } from 'ngx-pixel';
import { FacebookLoginProvider, SocialAuthService } from 'angularx-social-login';
@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html'
})
@Injectable({ providedIn: 'root' })
export class LoginModalComponent implements OnInit {
  auth2: any;
  @ViewChild('loginRef') loginElement!: ElementRef;
  @ViewChild('raffles') rafflesRef: ElementRef;
  public loading: boolean;
  public rememberMe: boolean = false;
  public showPassword = false;
  appleClientId: string = 'zangula.2raffle.Service';
  state: string = "Apple login done";
  redirectUrl: string = "https://client.staging.2raffle.zangula.net";
  scope: string = "name email";
  // Form fields
  public email: string;
  public password: string;
  public wrongCredentials: boolean;
  emailExistsErrors: boolean = false;
  emailExistsErrorsMsg: string;
  public connectedUser: ConnectedUserModel;
  public currentUser: ConnectedUserModel;
  public raffle: RaffleFullModel;
  private selectedLanguage: string;
  public previousUrl: string;
  public UserBlockedErrors: boolean;
  // rememberMe: boolean = false;
  // campaign fileds
  public campaignModel = new MarketingCampaignModel();
  constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal, private toastr: ToastrService,
    public modalService: RafflesModalService,private socialAuthService: SocialAuthService, private mainService: MainService, private jwtHelper: JwtHelperService, private route: ActivatedRoute, private winningService: WinningService, private pixel: PixelService) { }
  callLogin() {
    this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
      (googleAuthUser: any) => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaa", googleAuthUser);
        //Print profile details in the console logs
        let profile = googleAuthUser.getBasicProfile();

      this.accountService.socialLogin(profile.getEmail(), profile.getName(), profile.getName(), "", true, profile.getImageUrl(), this.selectedLanguage).pipe(
        finalize(() => {
          this.loading = false;
        })
      )
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.result) {
            let obj = [{
              'Name': response.data.fullName,
              'Id': response.data.id,
              'Email': response.data.email
            }]
            this.pixel.trackCustom('LoginSuccessfully', {
              content_name: 'LoginSuccessfully',
              contents: obj,
              status: true
            });
            this.router.navigate(['/home']);
            localStorage.setItem("currentUSer", JSON.stringify(response.data));
            sessionStorage.setItem("token", response.data.tokenResult);
            this.activeModal.close(response.data.id);
            this.connectedUser = response.data;
            this.accountService.updateConnectedUser(response.data);
            this.saveCampionDetails(response.data.id);
            this.setRout(response.data.id)
            this.accountService.getProfileImageOfUser()
          } else {
            this.pixel.trackCustom('LoginFailed', {
              content_name: 'LoginFailed',
              contents: response.error,
              status: true
            });
          }
        });
        }, (error: any) => {
        alert(JSON.stringify(error, undefined, 2));
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

  raffleUrl: string = "";
  ngOnInit(): void {
    this.googleAuthSDK();
    this.previousUrl = this.router.url;
    if (!window.location.href.includes("winnerPage")) {
      this.router.navigate(['/SignIn']);
    }

    var dec = this.jwtHelper.decodeToken('eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiemFuZ3VsYS4ycmFmZmxlLlNlcnZpY2UiLCJleHAiOjE2NDUxNzU2ODQsImlhdCI6MTY0NTA4OTI4NCwic3ViIjoiMDAxMjAyLjg3ZjA3NWE1MTA4NzRhZDI4MGNhMzBiZDdjZWYwN2MwLjExMzYiLCJjX2hhc2giOiJOWWU5c0w3ZXNhS0Q1czhSYWY4a05BIiwiZW1haWwiOiJxYUBnZW5lc2lzdGVjaG5vbG9naWVzLmluIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiYXV0aF90aW1lIjoxNjQ1MDg5Mjg0LCJub25jZV9zdXBwb3J0ZWQiOnRydWV9.taJal_1nC2RSCu39vIur5TCXBI6_hDqiX9VDqZNedRZHrTFxo4HwPlnsDPgPo4mkRyyaJ9Tbrzo3Xx0Lzr7dALa3iHDWCs_VNA_mky2zjQFZ574pqXm6_9VxviWHI_RauPAMnltrXSc8DqGlhtbhU64XrljnnoTwQuR6Thl4NWG85_4v9woxg7q_atilsOq_YMRGbouPEV9RXcM-77hfF_FJoCNpNwu2RUoVLWv273h0dEjudBQ_yxNBDafHBnS_iyPgm4QCEXFvvVdRSqCROgPF8WdGvFyxk-6uWJ2sORFgV7O8AzeGPSTLHyyrJDp7LubQAYfiRvYzPyTHMhYKyg');
    console.log("decode ... ", dec);
    this.accountService
      .getConnectedUser()
      .subscribe((user: ConnectedUserModel) => {
        if (user != null) {
          this.router.navigate(['/home']);
        }
      });
    this.raffleUrl = window.location.href.split("/")[3];
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
  }
  public login(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }
    this.pixel.trackCustom('InitiateLogin', {
      content_name: 'InitiateLogin',
      status: true
    });
    this.rememberMe = f.value.rememberMe
    this.wrongCredentials = false;
    this.loading = true;
    f.form.disable();

    this.accountService
      .login(this.email, this.password, this.rememberMe)
      .pipe(
        finalize(() => {
          this.loading = false;
          f.form.enable();
        })
      )
      .subscribe((response: ServerResponse<ConnectedUserModel>) => {
        if (response.result) {
          //===================
          let obj = [{
            'Name': response.data.fullName,
            'Id': response.data.id,
            'Email': response.data.email
          }]
          this.pixel.trackCustom('LoginSuccessfully', {
            content_name: 'LoginSuccessfully',
            contents: obj,
            status: true
          });
          if (!window.location.href.includes('winnerPage')) {
            if (this.previousUrl == "/SignUp" && window.location.href.includes("SignIn")) {
              this.router.navigate([localStorage.getItem("lastprivious").toString()])
            }
            else {
              this.router.navigate([this.previousUrl]);
            }
          }
          this.activeModal.close(response.data.id);
          this.connectedUser = response.data;
          sessionStorage.setItem("token", response.data.tokenResult);
          this.mainService.getPersonalUserInfoData(response.data.id).subscribe((res: ServerResponse<any>) => {
            if (res.result && res.data) {
              response.data['profileImageUrl'] = this.accountService.getServerUrl(res.data.profileImageUrl);
            }
            // Remember me
            localStorage.setItem("currentUSer", JSON.stringify(response.data));
            this.accountService.updateConnectedUser(response.data);
            if (this.rememberMe) {
              localStorage.setItem("token", response.data.tokenResult);
            }
            // this.activeModal.close(response.data.id);
            this.setRout(response.data.id);

            this.accountService.getProfileImageOfUser();

            if (localStorage.getItem("fromAutoGenratedPassLink") === "true") {
              this.router.navigate(["/my-account/personal-info"]);
              localStorage.removeItem("fromAutoGenratedPassLink");
            }

            this.accountService.getProfileImageOfUser();
            var activeurl = this.router.url;
            if (activeurl == "/winner") {
              this.router.navigate(['/winner']);
              window.location.reload();
            }
          }, (error) => {
            this.loading = false;
            //  this.accountService.checkErrorResponse(error);
          });
          //==================
        } else {
          this.loading = false;
          console.error(response.error, response.result);
          // this.wrongCredentials = true;
          this.pixel.trackCustom('LoginFailed', {
            content_name: 'LoginFailed',
            contents: response.error,
            status: true
          });
          if (response.error == "AccountBlocked") {
            this.emailExistsErrors = false;
            this.UserBlockedErrors = true;
            this.emailExistsErrorsMsg = "Password and Email doesn't match"
          }
          else if (response.error === "IncorrectEmail" || response.error == "IncorrectPassword") {
            this.emailExistsErrors = true
            this.wrongCredentials = true;
            this.UserBlockedErrors = false;
            this.emailExistsErrorsMsg = "Password and Email doesn't match"
          }
        }
      }, (error) => {
        this.loading = false;
        console.log("error:: ", error);
        this.pixel.trackCustom('LoginFailed', {
          content_name: 'LoginFailed',
          contents: error,
          status: true
        });
        // this.accountService.checkErrorResponse(error);
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // loginWithGoogle(): void {
  //   console.log("Login with Google");
  //   this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x: any) => {
  //     this.accountService.socialLogin(x.email, x.firstName, x.lastName, "", true, x.photoUrl, this.selectedLanguage).pipe(
  //       finalize(() => {
  //         this.loading = false;
  //       })
  //     )
  //       .subscribe((response: ServerResponse<ConnectedUserModel>) => {
  //         if (response.result) {
  //           let obj = [{
  //             'Name': response.data.fullName,
  //             'Id': response.data.id,
  //             'Email': response.data.email
  //           }]
  //           this.pixel.trackCustom('LoginSuccessfully', {
  //             content_name: 'LoginSuccessfully',
  //             contents: obj,
  //             status: true
  //           });
  //           this.router.navigate(['/home']);
  //           localStorage.setItem("currentUSer", JSON.stringify(response.data));
  //           sessionStorage.setItem("token", response.data.tokenResult);
  //           this.activeModal.close(response.data.id);
  //           this.connectedUser = response.data;
  //           this.accountService.updateConnectedUser(response.data);
  //           this.saveCampionDetails(response.data.id);
  //           this.setRout(response.data.id)
  //           this.accountService.getProfileImageOfUser()
  //         } else {
  //           this.pixel.trackCustom('LoginFailed', {
  //             content_name: 'LoginFailed',
  //             contents: response.error,
  //             status: true
  //           });
  //         }
  //       });
  //   });
  // }

  facebookSignin(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((x: any) => {
      this.accountService.socialLogin(x.email, x.firstName, x.lastName, "", true, x.photoUrl, this.selectedLanguage).pipe(
        finalize(() => {
          this.loading = false;
        })
      )
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.result) {
            console.log("-response-", response);
            let obj = [{
              'Name': response.data.fullName,
              'Id': response.data.id,
              'Email': response.data.email
            }]
            this.pixel.trackCustom('LoginSuccessfully', {
              content_name: 'LoginSuccessfully',
              contents: obj,
              status: true
            });
            this.router.navigate(['/home']);
            localStorage.setItem("currentUSer", JSON.stringify(response.data));
            sessionStorage.setItem("token", response.data.tokenResult);
            this.accountService.updateConnectedUser(response.data);
            this.saveCampionDetails(response.data.id);
            this.activeModal.close();
            this.connectedUser = response.data;
            this.setRout(response.data.id)

            this.accountService.getProfileImageOfUser()
          } else {
            this.pixel.trackCustom('LoginFailed', {
              content_name: 'LoginFailed',
              contents: response.error,
              status: true
            });
          }
        });
    });
  }

  appleSignin(): void {
    window['AppleID'].auth.signIn().then((res) => {
      var decode = this.jwtHelper.decodeToken(res.authorization.id_token);
      console.log("apple login response::    ", res);
      var email = decode.email;
      this.accountService.socialLogin(email, "", "", "", true, "", this.selectedLanguage).pipe(
        finalize(() => {
          this.loading = false;
        })
      )
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.result) {
            let obj = [{
              'Name': response.data.fullName,
              'Id': response.data.id,
              'Email': response.data.email
            }]
            this.pixel.trackCustom('LoginSuccessfully', {
              content_name: 'LoginSuccessfully',
              contents: obj,
              status: true
            });
            this.router.navigate(['/home']);
            localStorage.setItem("currentUSer", JSON.stringify(response.data));
            sessionStorage.setItem("token", response.data.tokenResult);
            this.accountService.updateConnectedUser(response.data);
            this.activeModal.close(response.data.id);
            this.connectedUser = response.data;
            this.setRout(response.data.id)
            this.accountService.getProfileImageOfUser()
          } else {
            this.pixel.trackCustom('LoginFailed', {
              content_name: 'LoginFailed',
              contents: response.error,
              status: true
            });
          }
        });
    });
  }

  private saveCampionDetails(userId: number) {
    if (window.location.href.includes('?')) {
      var isWinner, isSignUp, isPurchase, isReset = false;
      this.route.queryParams.subscribe((pa) => {
        if (pa.winnerPage) { isWinner = true; }
        if (pa.resetPassword) { isReset = true; }
        if (pa.validateUser) { isSignUp = true; }
        var keys = Object.keys(pa);
        keys.forEach((ele, i) => {
          switch (ele.toLowerCase()) {
            case "source": this.campaignModel.source = pa[ele]; break;
            case "raffleid": this.campaignModel.raffleId = pa[ele]; break;
            case "campaignid": this.campaignModel.campaignId = pa[ele]; break;
            case "clickid": this.campaignModel.clickId = pa[ele]; break;
            case "fullurl": this.campaignModel.fullUrl = pa[ele]; break;
            case "dyn1": this.campaignModel.dyn1 = pa[ele]; break;
            case "dyn2": this.campaignModel.dyn2 = pa[ele]; break;
            case "dyn3": this.campaignModel.dyn3 = pa[ele]; break;
            case "dyn4": this.campaignModel.dyn4 = pa[ele]; break;
            case "dyn5": this.campaignModel.dyn5 = pa[ele]; break;
            default: this.campaignModel = new MarketingCampaignModel(); break;
          }
        })
      })

      if ((this.campaignModel != undefined || this.campaignModel != null) && !isWinner && !isReset && !isSignUp) {
        this.campaignModel.userId = userId;
        this.campaignModel.fullUrl = window.location.href;
        this.accountService.saveMarketingCampaign(this.campaignModel).subscribe((res) => {
          if (res.result) {
            console.log("campagin save!!");
          }
        })
      }
    }
  }

  setRout(userId) {
    console.log(";;;this.raffleUrl ", this.raffleUrl);
    // if (this.raffleUrl == "raffle") {
    //   this.openPaymentForm(this.modalService.raffleCurrentPayment);
    // }
    this.route.queryParams.subscribe(params => {
      if (params.winnerPage) {
        console.log()
        this.winningService.checkUserIsWinner(params.winnerId, userId, params.winningTicketId).subscribe(data => {
          if (data.result && data.data == "Not Claimed") {
            this.modalService.openCongratulationsModal(params);
          }
          else if (data.result && data.data == "Claimed") {
            this.toastr.info(this.accountService.getKeyValue('toastr_Reward_Already_Collected'));
          }
          else if (data.result && data.data == "Different User") {
            this.toastr.error(this.accountService.getKeyValue('toastr_invalid_user_details'));
          }
        })
      }
    })
  }

  getProfileImage() {
    const userId = this.accountService.getConnectedUserSync();
    this.accountService.getProfileImage(userId.id).subscribe(response => {
      if (response.result) {
        var url = response.data.profileImageUrl;
        const image = url == null || url == undefined ? "https://i.stack.imgur.com/34AD2.jpg" : this.accountService.getServerUrl(response.data.profileImageUrl);
        this.accountService.profileChange(image);
      }
    }, (error) => {
      console.log("error:: ", error);
      this.accountService.checkErrorResponse(error);
    })
  }

  public scroll(): void {
    this.rafflesRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public bigImg() {
    //alert('HII')
  }
  public isEmailValid3: boolean = false;
  validateEmail3(email) {
    let isValid = String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    console.log("-------", isValid);
    if (isValid != null) {
      this.isEmailValid3 = false;
    }
    else {
      this.isEmailValid3 = true;
    }
  };
  public activemodalclose1() {
    this.activeModal.dismiss('Cross click');
    if (!window.location.href.includes("winnerPage")) {
      if (this.previousUrl == "/SignUp" || window.location.href.includes("/ForgotPassword") || window.location.href.includes("/SignIn") || window.location.href.includes("?resetPassword")) {
        this.router.navigate([localStorage.getItem("lastprivious").toString()])
      }
      else {
        this.router.navigate([this.previousUrl]);
      }
    }
  }
}
