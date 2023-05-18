import { Component, OnInit } from '@angular/core';
import {AccountService} from '../../services/account.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {RafflesModalService} from '../../services/raffles-modal.service';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styles: [],
})
export class ForgotPasswordModalComponent implements OnInit {
  public loading: boolean;

  // Form fields
  public email: string;
  public code: string;

  constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal, private toastr: ToastrService,
              public modalService: RafflesModalService) {
  }

  ngOnInit(): void {
   this.router.navigate(['\ForgotPassword']);
    this.accountService
        .getConnectedUser()
        .subscribe((user: ConnectedUserModel) => {
          if (user != null) {
            this.router.navigate(['/home']);
          }
        });
  }

  public sendPasswordRecovery(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }

    this.loading = true;
    f.form.disable();

    this.accountService
        .getResetPasswordCode(this.email)
        .pipe(
            finalize(() => {
              this.loading = false;
              f.form.enable();
            })
        )
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.result) {
              // Show the success popup.
              this.router.navigate([localStorage.getItem("lastprivious").toString()]); 
              this.modalService.openForgotPasswordEmailSentModal();
          }
          else {
            this.toastr.error(this.accountService.getKeyValue('toastr_Username_does_not_exist'));
            // alert('Username does not exist.');
          }
        });
  }
  public isEmailValid1:boolean=false;
  validateEmail1 (email) {
    let isValid =  String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if(isValid != null){
        this.isEmailValid1 = false;
      }
      else{
        this.isEmailValid1 = true;
      }
  };
  public Activemodalclose()
  {
    this.activeModal.dismiss('Cross click');
    this.router.navigate([localStorage.getItem("lastprivious").toString()]); 
  }

 
}
