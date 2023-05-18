import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { ServerResponse } from 'src/app/interfaces/server-response';
import { AccountService } from 'src/app/services/account.service';
import {ContactModel} from '../../models/contact-model';
import {ToastrService} from 'ngx-toastr';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  public loading: boolean;
  public contactModel: ContactModel;
  email : string = "";
  mobNumberPattern = "^((\\+91-?)|0)?[0-9]{10}$";

  constructor(private accountService: AccountService, private toastr: ToastrService) {
    this.contactModel = new ContactModel("","","","","");
   }

  ngOnInit(): void {

  }

  public Submit(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return;
    }
    this.loading = true;
    f.form.disable();
    this.accountService.contact(this.contactModel)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    f.form.enable();
                })
            )
            .subscribe((response: ServerResponse<ContactModel>) => {
                if (response.data) {
                  f.resetForm();
                    this.toastr.success(this.accountService.getKeyValue('toastr_action_was_compelted'));
                } else {
                    this.toastr.error(this.accountService.getKeyValue('toastr_action_was_not_completed'));
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
      console.log("-------",isValid);
      if(isValid != null){
        this.isEmailValid1 = false;
      }
      else{
        this.isEmailValid1 = true;
      }
  };
}
