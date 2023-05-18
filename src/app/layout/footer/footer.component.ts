import { Component, OnInit, HostListener, Input } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import { RafflesModalService } from "../../services/raffles-modal.service";
import { AccountService } from "../../services/account.service";
import { ConnectedUserModel } from "../../interfaces/user-model";
import { SubscriberDataModel } from 'src/app/models/subscriber-model';
import { ToastrService } from 'ngx-toastr';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  pageYoffset = 0;
  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYoffset = window.pageYOffset;
  }
  public currentUser: ConnectedUserModel;
  public subscriberDataModel: SubscriberDataModel = new SubscriberDataModel();
  termsOfUse: boolean;
  public termsAccepted: boolean;
  email: string;
  subscriberEmail: string;
  isChecked: boolean = false;
  public checkdevice:boolean;
  public UserAlredyExist:boolean=false;
  constructor(public modalService: RafflesModalService, public accountService: AccountService, private toastr: ToastrService, private scroll: ViewportScroller,private route: ActivatedRoute) {
  }
  scrollToTop() {
    this.scroll.scrollToPosition([0, 0]);
  }
  ngOnInit(): void {
      this.accountService.getConnectedUser().subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser == null) {
      }
    });
    setTimeout(() => {
      var checkmobileOrDesktop=navigator.platform.includes("Win");
      if(checkmobileOrDesktop){
          this.checkdevice=checkmobileOrDesktop;
      }},500);
  }
  private initUser(): void {
    this.currentUser = this.accountService.getConnectedUserSync();
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
      this.currentUser = connectedUser;
    });
  }
  public onSubmit(form: NgForm): void {
    if (form.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(form);
      return;
    }
    if (!this.termsAccepted) {
      this.isChecked = true;
      return
    }
    this.subscriberDataModel.SubscriberEmail = this.subscriberEmail;
    this.subscriberDataModel.IsUnsubscribed = true //!this.termsOfUse ? 0 : 1;
    this.accountService.SaveSubscriberData(this.subscriberDataModel).subscribe((response: any) => {
      form.reset();
      if(response.result){
        this.toastr.success(this.accountService.getKeyValue('toastr_request_submit_sucessfully'));
        this.termsAccepted = false;
        this.isChecked = false;
        this.termsOfUse = false;
      }
      else{
        this.UserAlredyExist=true;
      }

    });
    this.termsAccepted = false;
    form.reset();
  }
  public isEmailValid: boolean = false;
  validateEmail(email) {
    this.UserAlredyExist=false;
    let isValid = String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      );
    if (isValid != null) {
      this.isEmailValid = false;
    }
    else {
      this.isEmailValid = true;
    }
  };
  

  



}
