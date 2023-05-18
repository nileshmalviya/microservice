import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {RafflesModalService} from '../../services/raffles-modal.service';
import {NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {AccountService} from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-password-modal',
  templateUrl: './new-password-modal.component.html',
  styles: [],
})
export class NewPasswordModalComponent implements OnInit {
  @Input() code: string;
  @Input() email: string;

  public passwordStrengthRegex: RegExp;

  loading = false;
  password: string;
  passwordAgain: string;

  showPassword = false;
  isEqualPassword = false;
  showAgainPassword = false;
  linkExpireErrors: boolean = false;
  linkExpireErrorsMsg: string;
  constructor(public activeModal: NgbActiveModal, private modalService: RafflesModalService,
              private accountService: AccountService ,private route:ActivatedRoute,private router:Router) {}

  ngOnInit(): void {
    this.passwordStrengthRegex = this.accountService.passwordStrengthRegex;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  isEqual(){

    if(this.passwordAgain==undefined){
      console.log("heyyyyyyyyyy mahi")
      this.isEqualPassword=true
    }else{
      this.isEqualPassword = this.password == this.passwordAgain ? true : false;

      console.log("--this.isEqualPassword-->", this.isEqualPassword);
      console.log("--this.this.password-->", this.password);
      console.log("--this.passwordAgain-->", this.passwordAgain);
      
    }
    
  }
  
  toggleAgainPasswordVisibility(): void {
    this.showAgainPassword = !this.showAgainPassword;
  }

  sendNewPassword(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);

      return;
    }

    this.loading = true;
    f.form.disable();
    console.log( "--code--->",this.code  );
    this.accountService.resetPassword(this.email, this.code, this.password) 
    
        .pipe(
            finalize(() => {
              this.loading = false;
              f.form.enable();
            })
        )
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.data) {
            this.modalService.openLoginModal();
          } else {
            this.linkExpireErrors=true
            this.linkExpireErrorsMsg= this.accountService.getKeyValue('link_expire')
            console.error(response.error, response.result);
          }
        });
  }
  public closeActiveModal(){
    this.activeModal.dismiss('Cross click');
    this.router.navigate(['/home']);
    }
}
