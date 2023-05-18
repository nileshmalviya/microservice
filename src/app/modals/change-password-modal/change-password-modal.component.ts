import { Component, Input, OnInit } from '@angular/core';
import {AccountService} from '../../services/account.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {RafflesModalService} from '../../services/raffles-modal.service';
import {ChangePasswordData, ConnectedUserModel, UserDataModel} from '../../interfaces/user-model';
import {NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styles: [],
})
export class ChangePasswordModalComponent implements OnInit {
    @Input() public userDataModel: UserDataModel;
    public showPasswordOld = false;
    public showPasswordNew = false;
    public showPasswordRepeat = false;
    public passwordStrengthRegex: RegExp;
 oldPasswordError: boolean = false;
 passwordMissMatch: boolean = false;
    public changePasswordData: ChangePasswordData = new ChangePasswordData();
  // Form fields
  connectedUser: ConnectedUserModel = null;
  constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal,
              public modalService: RafflesModalService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.router.navigate(['\ChangePassword']);
    this.passwordStrengthRegex = this.accountService.passwordStrengthRegex;
  }

  togglePasswordVisibility(field: string): void {
     if(field == "old") {
      this.showPasswordOld = !this.showPasswordOld;
     } else if(field == "new") {
      this.showPasswordNew = !this.showPasswordNew;
     } else if(field == "repeat") {
      this.showPasswordRepeat = !this.showPasswordRepeat;
     }
  }

  public updateUserPassword(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }
    f.form.disable();
    console.log("f: ", f);
    if(this.changePasswordData.newPassword === this.changePasswordData.repeatNewPassword) {
      const passwordData = {
        userId: this.userDataModel.id,
        oldPassword: this.changePasswordData.oldPassword,
        newPassword: this.changePasswordData.newPassword
      };
      this.accountService
          .getChangePassword(passwordData)
          .pipe(
              finalize(() => {
                f.form.enable();
              })
          )
          .subscribe((response: ServerResponse<any>) => {

            if(response.data === "Old Password Incorrect!") {
              // this.toastr.error('Old password is not correct.');
               this.oldPasswordError = true;
              f.form.enable();
            } else {
               this.oldPasswordError = false;
              if (response.result) {
                  this.toastr.success(this.accountService.getKeyValue('toastr_password_update_sucessfully'));
                  this.router.navigate(['/home']);
              } else {
                  this.toastr.error(this.accountService.getKeyValue('toastr_password_update_not_sucessfully'));
              }
              this.activeModal.dismiss('Cross click');
            }
          });
    } else {
      this.passwordMissMatch = true;
      // this.toastr.error('New password not matched.');
      f.form.enable();
    } }
  public activeModalClose(){
    this.activeModal.dismiss('Cross click');
    this.router.navigate(['/home']);
  }
}
