import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ServerResponse } from '../../interfaces/server-response';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserModel, UserInfoDataModel } from '../../interfaces/user-model';
import TwoRaffleHelpers from '../../helpers/helpers';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RafflesModalService } from '../../services/raffles-modal.service';
import { WinningService } from 'src/app/services/winning.service';
import { UserDataModel } from 'src/app/interfaces/user-model';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from 'angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { MainService } from 'src/app/services/main.service';
import { AppConfig } from 'src/app/services/app.config';

@Component({
  selector: 'app-ongratulations-modal',
  templateUrl: './congratulations-modal.component.html',
})
export class CongratulationsModalComponent implements OnInit {
  public loading: boolean;
  public rememberMe = true;
  public showPassword = false;
  public winnerDetailsCorrectOrNot:boolean=false;
  myform: NgForm;
  @Input() public winner: any;
  // Form fields
  public email: string;
  public password: string;
  public wrongCredentials: boolean;
  public phoneNumber:string;
  public firstName: string = null;
  public lastName: string;
  public idNumber: number;
  public country: string;
  public countryID:number;
  public city: string;
  public address: string;
  public zipCode: string;
  public isReachedMaturity: boolean;
  public isOpenAnonymousAcccount: boolean;
  connectedUser: ConnectedUserModel;
  public passwordStrengthRegex: RegExp;
  public idNumberRegex: RegExp;
  public phoneNumberRegex:RegExp;
  public zipCodeRegex: RegExp;
  public currentUser: any;
  productName: string;
  selectedLanguage :string;
  public ShowVideoImg:boolean=false;
  public userInfoDataModel: UserInfoDataModel = new UserInfoDataModel();
  public userDataModel: UserDataModel = new UserDataModel();
  constructor(
    private accountService: AccountService,
    private router: Router,
    public activeModal: NgbActiveModal,
    public modalService: RafflesModalService,
    public winningService: WinningService,
    private socialAuthService: SocialAuthService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private mainService: MainService

  ) {
    this.route.queryParams.subscribe(params => {
      if(params.productId){
        this.getProductNameById(params.productId);
      }
    })
  }

  ngOnInit(): void {
    
    this.idNumberRegex = this.accountService.idNumberRegex;
    this.phoneNumberRegex = this.accountService.phoneNumberRegex;
    this.zipCodeRegex = this.accountService.zipCodeRegex;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.accountService
      .getConnectedUser()
      .subscribe((user: ConnectedUserModel) => {
        console.log(";;;;;;;&&&;;===>aaaaa", user.firstName);
        this.firstName=user.firstName;
        this.lastName=user.lastName;
        
        this.mainService.getPersonalUserInfoData(user.id).subscribe((response)=>{
          if(response.data){
            
            console.log(response.data);
          this.countryID=response.data.countryId;
          this.address=response.data.address;
          this.city=response.data.city;
          this.zipCode=response.data.zipCode;
          this.getAllCountry(this.countryID);
          }else{
            
          }
        });
        if (user != null) {
          this.currentUser = user;
        } else {

        }
      });
       this.router.navigate(['/Congrutulations']);
      this.isWifiConneted();
  }

  public login(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }

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
          localStorage.setItem('currentUSer', JSON.stringify(response.data));
          this.accountService.updateConnectedUser(response.data);
          this.activeModal.close();
        } else {
          console.error(response.error, response.result);
          this.wrongCredentials = true;
        }
      });
  }


  getAllCountry(id) {
    this.mainService.getAllCountryData().subscribe((res: ServerResponse<any>)=>{
      if(res.result){
        console.log(res.result);
        res.data.forEach(element => {
           if(element.id==id){
              this.country=element.name;
            }
        });
      }
    }, (error)=>{
      console.log("error:: ",error);
      this.accountService.checkErrorResponse(error);
  });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((x: any) => {
        this.accountService
          .socialLogin(x.email, x.firstName, x.lastName, '', true,x.photoUrl,this.selectedLanguage)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe((response: ServerResponse<ConnectedUserModel>) => {
            if (response.result) {
              localStorage.setItem(
                'currentUSer',
                JSON.stringify(response.data)
              );
              this.accountService.updateConnectedUser(response.data);
              this.activeModal.close();
            }
          });
      });
  }

  public winnerCongratulation(f: NgForm): void {
    this.loading = true;
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      console.log(":::::::::", f.invalid);

      return;
    }
    f.form.disable();

    f.value.winner = {
      "winningTicketId": this.winner.winningTicketId,
      "winnerId": this.currentUser.id,
      "winnerClaimCode": this.winner.winnerClaimCode
    }

    this.winningService.winningCongratulation(f.value)
    .pipe(finalize(() => {
      //  this.isLoading = false;
      //this.activeModal.dismiss('Cross click')
      f.form.enable();
    }))
    .subscribe((response: ServerResponse<any>) => {
        if (!response.result) {
          this.toastrService.error("Invalid Credentails.");
          this.winnerDetailsCorrectOrNot=false;
          this.loading = false;

        } else {
          this.winnerDetailsCorrectOrNot=true;
          this.loading = false;

        }
      }, (err) => {
        // TODO: error
      });
    //this.winningService.winningCongratulation(f.value);
  }

  facebookSignin(): void {
    this.socialAuthService
      .signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((x: any) => {
        console.log(JSON.stringify(x));
        this.accountService
          .socialLogin(x.email, x.firstName, x.lastName, '', true,"",this.selectedLanguage)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe((response: ServerResponse<ConnectedUserModel>) => {
            if (response.result) {
              localStorage.setItem(
                'currentUSer',
                JSON.stringify(response.data)
              );
              this.accountService.updateConnectedUser(response.data);
              this.activeModal.close();
            }
          });
      });
  }

  public getProductNameById(id:string){
    this.accountService.getProductName(id).subscribe((data)=>{
      if(data.data){
        this.productName=data.data;
      }
    }, (error)=>{
      console.log("error:: ",error);
      this.accountService.checkErrorResponse(error);
  })
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
ActiveModalClose() {
  this.activeModal.dismiss('Cross click');
  this.router.navigate(['/home']);
}
}
