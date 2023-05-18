import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConnectedUserModel } from 'src/app/interfaces/user-model';
import { AccountService } from "src/app/services/account.service";
import { MainService } from 'src/app/services/main.service';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';
import { UserDataModel } from 'src/app/interfaces/user-model';
import { ServerResponse } from 'src/app/interfaces/server-response';
import { NgForm } from '@angular/forms';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss']
})

export class AccountSettingComponent implements OnInit {
  @Output() onUpdate = new EventEmitter<any>();
  mobNumberPattern = "^((\\+52-?)|0)?[0-9]{6,10}$";
  connectedUser: ConnectedUserModel = null;
  public userDataModel: UserDataModel = new UserDataModel();

  constructor(private mainService: MainService,
    private accountService: AccountService,
    private modalService: RafflesModalService, private toastr: ToastrService,) { }

  ngOnInit(): void {
    console.log("Account Setting page");
    this.connectedUser = this.accountService.getConnectedUserSync();
    if (this.connectedUser != null || this.connectedUser != undefined)
      this.getUserData();
    // else
    //   this.modalService.openRegisterModal();
  }

  ngOnDestroy(){
    if(this.connectedUser != null || this.connectedUser != undefined){
      this.accountService.IsUserBlock(this.connectedUser.id).subscribe(response => {
        if(response.result){
          this.accountService.userBlockEvent.emit(response.data);
        }
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
      })
    }
  }

  getUserData() {
    this.mainService.getLoggedInUserData(this.connectedUser.id).subscribe((res: ServerResponse<UserDataModel>) => {
      if (res.result) {
        this.userDataModel.id = res.data.id;
        this.userDataModel.email = res.data.email;
        this.userDataModel.firstName = res.data.firstName;
        this.userDataModel.lastName = res.data.lastName;
        this.userDataModel.fullName = res.data.firstName + " " + res.data.lastName;
        this.userDataModel.password = '********';
        this.userDataModel.phone = res.data.phone;
        this.userDataModel.country= res.data.country;
      }
    }, (error)=>{
      console.log("error:: ",error);
      this.accountService.checkErrorResponse(error);
  });
  }

  public Submit(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }
    f.form.disable();
    console.log("f: ", f);
    console.log("userDataModel: ", this.userDataModel);
    this.accountService.connectedUser.firstName = f.value.firstName
    this.accountService.connectedUser.lastName = f.value.lastName
    this.mainService.UpdateLoggedInUserData(this.userDataModel)
      .pipe(
        finalize(() => {
          f.form.enable();
        })
      )
      .subscribe((response: ServerResponse<UserDataModel>) => {
        console.log(response);
        if (response.result) {
          f.resetForm();
          this.getUserData();
          //===================

          this.mainService.getPersonalUserInfoData(response.result['Id']).subscribe((res: ServerResponse<any>) => {
            if (res.result) {

              this.accountService.connectedUser['profileImageUrl'] = this.accountService.getServerUrl(res.data['profileImageUrl']);
              localStorage.setItem("currentUSer", JSON.stringify(this.accountService.connectedUser));
            }
          }, (error)=>{
            console.log("error:: ",error);
          //  this.accountService.checkErrorResponse(error);
        });
          this.onUpdate.emit();
          this.toastr.success(this.accountService.getKeyValue('toastr_action_was_compelted'));
        } else {
          this.toastr.error(this.accountService.getKeyValue('toastr_action_was_not_completed'));
        }
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
    });
  }

  public initChangePassword(userDataModel: UserDataModel): void {
    this.modalService.openChangePasswordModal(userDataModel);
  }

}
