import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ServerResponse } from '../../interfaces/server-response';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserModel } from '../../interfaces/user-model';
import TwoRaffleHelpers from '../../helpers/helpers';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RafflesModalService } from '../../services/raffles-modal.service';
import { WinningService } from 'src/app/services/winning.service';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from 'angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { RaffleFullModel } from 'src/app/interfaces/raffle';
import { RafflePackageModel } from 'src/app/interfaces/data-models';

@Component({
  selector: 'app-ongratulations-modal',
  templateUrl: './payment-failed-modal.component.html',
})
export class PaymentFailedModalComponent implements OnInit {
  public loading: boolean;
  public rememberMe = true;
  public showPassword = false;
  myform: NgForm;
  @Input() public winner: any;
  @Input() public raffle: RaffleFullModel;
  @Input() public selectedPackage: RafflePackageModel;
  // Form fields
  public email: string;
  public password: string;
  public wrongCredentials: boolean;

  public firstName: string = null;
  public lastName: string;
  public idNumber: number;
  public country: string;
  public city: string;
  public address: string;
  public zipCode: number;
  public isReachedMaturity: boolean;
  public isOpenAnonymousAcccount: boolean;
  connectedUser: ConnectedUserModel;
  public passwordStrengthRegex: RegExp;
  public idNumberRegex: RegExp;
  public zipCodeRegex: RegExp;
  public currentUser: any;
  productName: string;
  private selectedLanguage :string;

  constructor(
    private accountService: AccountService,
    private router: Router,
    public activeModal: NgbActiveModal,
    public modalService: RafflesModalService,
    public winningService: WinningService,
    private socialAuthService: SocialAuthService,
    private toastrService: ToastrService,
    private route: ActivatedRoute

  ) {
    this.route.queryParams.subscribe(params => {
      if(params.productId){
        this.getProductNameById(params.productId);
      }
    })
  }

  ngOnInit(): void {
    this.router.navigate(['\PaymentFailed']);
    this.idNumberRegex = this.accountService.idNumberRegex;
    this.zipCodeRegex = this.accountService.zipCodeRegex;
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.accountService
      .getConnectedUser()
      .subscribe((user: ConnectedUserModel) => {
        console.log(";;;;;;;&&&;;===>", user);

        if (user != null) {
          this.currentUser = user;
         // this.router.navigate(['/home']);
        } else {

        }
      });
     
      
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
              sessionStorage.setItem("token", response.data.tokenResult);
              this.accountService.updateConnectedUser(response.data);
              this.activeModal.close();
              this.accountService.getProfileImageOfUser()
            }
          });
      });
  }

  public winnerCongratulation(f: NgForm): void {
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
      this.activeModal.dismiss('Cross click')
      f.form.enable();
    }))
    .subscribe((response: ServerResponse<any>) => {
      console.log("--------this.winnerthis.winnerthis.winner------->", response);
        if (!response.result) {
      this.toastrService.success(this.accountService.getKeyValue('toastr_invalid_credentails'));

        } else {
          this.toastrService.success(this.accountService.getKeyValue('toastr_your_request_has_been_submitted_sucessfully'));

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
              sessionStorage.setItem("token", response.data.tokenResult);
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

  public tryAgainEvent(){
    this.router.navigate([localStorage.getItem("lastprivious").toString()]);
    this.modalService.openPaymentModal(this.raffle,this.selectedPackage);

  }
 public Activemodalclose(){
  this.activeModal.dismiss('Cross click');
  this.router.navigate(['/home']);
 }
}
