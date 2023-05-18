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
import { PixelService } from 'ngx-pixel';
import { flatten } from '@angular/compiler';

@Component({
    selector: 'app-otp-varify-modal',
    templateUrl: './otp-varify-modal.component.html',
})

export class OtpModalComponent implements OnInit
{
    @ViewChild('email2', { read: ElementRef, static:false }) validationclass: ElementRef;
    @ViewChild('editIcon', { read: ElementRef, static:false }) ImageEditIcon: ElementRef;
    public Otpnotmatch:string="";
    public otpValue:string="";
    public arr: string[]=["0", "0", "0", "0"];
    public arr1: string[]=["", "", "", ""];
    public validation_message_hide:string="block";
    OTP_Val:string="";
    public UserID:any;
    public Email:string="";
    public Otp_send:boolean=false;
    public tx1:any;
    public tx2:any;
    public tx3:any;
    public tx4:any;
    public showTimer: boolean = false;
    public timeLeft: number = 30;
    public interval:any;
    public newEmail:string;
    public savebutton:boolean=false;
    public NewEmailVisibleOrNot:boolean=true;
    public userExistsErrors:boolean=false;
    public test:boolean=false;
    public isBlockNone:string="block";
    public previousUrl:string;
    public displayEditEmail:boolean;
    ngOnInit(): void {
            this.router.navigate(['/OTP']);
             
}
    constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal,
    public modalService: RafflesModalService,
    private socialAuthService: SocialAuthService,private mainServic: MainService,private jwtHelper :JwtHelperService,private route:ActivatedRoute,
    private toastr: ToastrService,private pixel: PixelService)
    {

    }
    public otp_number = [/[0-9]/]; 
    ngAfterViewInit(): void {
        setTimeout(() =>{
            document.getElementById("input1").focus();
        },500);
        this.accountService.getConnectedUser().subscribe((user) => {
            this.newEmail=user.email;
        });
    }
    numSequence(n: number): Array<number> {
        return Array(n);
      }
     
    inputfield1(event:any){
        this.Otpnotmatch = '';
        event.value = event.value == "" || event.value == undefined ? '' : event.value[event.value.length-1] ;
        this.arr[0]=""+event.value;
        this.arr1[0]=""+event.value;
        if(event.value){
            document.getElementById("input2").focus();
        }
        this.OTP_Val = this.arr1[0] + this.arr1[1] + this.arr1[2] + this.arr1[3];
    };

  
    inputfield2(event:any){
        this.Otpnotmatch = '';
        event.value = event.value == "" || event.value == undefined ? '' : event.value[event.value.length-1] ;
        this.arr[1]=""+event.value;
        this.arr1[1]=""+event.value;
        if(event.value){
            document.getElementById("input3").focus();
        }
        this.OTP_Val = this.arr1[0] + this.arr1[1] + this.arr1[2] + this.arr1[3];
    };
    inputfield22(event){
        if(event.keyCode==8 || event.keyCode==46){
            document.getElementById("input1").focus();
        }
     }
    inputfield3(event:any){
        this.Otpnotmatch = '';
        event.value =event.value == "" || event.value == undefined ? '' : event.value[event.value.length-1] ;
        this.arr[2]=""+event.value;
        this.arr1[2]=""+event.value;
        if(event.value){
            document.getElementById("input4").focus();
        }
        this.OTP_Val = this.arr1[0] + this.arr1[1] + this.arr1[2] + this.arr1[3];
    };

    inputfield33(event){
        if(event.keyCode==8 || event.keyCode==46){
            document.getElementById("input2").focus();
        }
     }

    inputfield4(event:any){
        this.Otpnotmatch = '';
        event.value = event.value == "" || event.value == undefined ? '' : event.value[event.value.length-1] ;
        this.arr[3]=""+event.value;
        this.arr1[3]=""+event.value;
        this.OTP_Val = this.arr1[0] + this.arr1[1] + this.arr1[2] + this.arr1[3];
    };
    inputfield44(event){
        if(event.keyCode==8 || event.keyCode==46){
            document.getElementById("input3").focus();
        }
     }

    public  varifyOtp(){
        if(this.OTP_Val.length < 4){
            this.Otpnotmatch = this.accountService.getKeyValue('toastr_Invalid_OTP');
           // this.toastr.error(this.accountService.getKeyValue('toastr_Invalid_OTP'));
        }else{
            var otp=""+this.arr[0]+this.arr[1]+this.arr[2]+this.arr[3];
            this.otpValue=otp;
            var dataforid=localStorage.getItem("currentUSer");
            var useridData =JSON.parse(dataforid);
            this.UserID=useridData.id;
             this.accountService.OtpVarification(this.UserID,this.otpValue).subscribe((response: ServerResponse<ConnectedUserModel>) => {
                 if (response.data) {
                    var getcurrentUser= localStorage.getItem("currentUSer");
                    this.activeModal.close(response.data);
                    this.router.navigate([localStorage.getItem("lastprivious").toString()])
                    if(!this.accountService.isPaymentCall){
                        this.modalService.openOtpAwesomeModal();
                        // this.pixel.trackCustom('Thankyou Page', {
                        //     status:true
                        // });
                    }
                    var data= JSON.parse(getcurrentUser);
                 }else{
                    this.Otpnotmatch = this.accountService.getKeyValue('toastr_Invalid_OTP,_Please_enter_correct_otp');
                   // this.toastr.error(this.accountService.getKeyValue('toastr_Invalid_OTP,_Please_enter_correct_otp'));
                 }
                 this.UserID="";
                 this.otpValue="";
              });
        }
    };

    public timerOtpSend()
    {
        this.NewEmailVisibleOrNot=false;
        this.showTimer = true;
        this.timeLeft = 30;
        this.interval = null;
        this.interval = setInterval(() => {
            if(this.timeLeft > 0) {
             this.ImageEditIcon.nativeElement.classList.add('otpEditIcon');
             this.savebutton=true;
             this.timeLeft--;
            } else {
             this.savebutton=false;
             this.showTimer = false;
             clearInterval(this.interval);
             this.NewEmailVisibleOrNot=true;
             this.ImageEditIcon.nativeElement.classList.remove('otpEditIcon');
            }
          },1000);
    }

    public ResendOtp(){
        this.NewEmailVisibleOrNot=false;
        this.timerOtpSend();
        var dataforid=localStorage.getItem("currentUSer");
        var useridData =JSON.parse(dataforid);
        this.UserID=parseInt(useridData.id);
        this.Email=useridData.email;
        this.accountService.resendOtp(this.UserID,this.Email).subscribe((response: ServerResponse<ConnectedUserModel>) => {
            if (response){
                this.toastr.info(this.accountService.getKeyValue('toastr_New_OTP_has_been_send_successfully'));
            }
            this.UserID="";
            this.otpValue="";
        });
    };

    public isEmailValid1:boolean=false;
  validateEmail (email) {
    let isValid =  String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if(isValid != null){
        this.isEmailValid1 = false;
        this.validationclass.nativeElement.classList.remove('PaymentEmailField');
      }
      else{
        this.validationclass.nativeElement.classList.add('PaymentEmailField');
        this.isEmailValid1 = true;
      }
  };

  updateEmail(){
    this.accountService.getConnectedUser().subscribe((user) => {
              if (user != null && !this.isEmailValid1) {
                  this.accountService.UpdateEmail(user.id,this.newEmail).subscribe((res)=>
                  {
                     if(res.result){
                        this.newEmail=res.data.email;
                        this.toastr.info(this.accountService.getKeyValue('toastr_New_Email_has_been_Update_successfully'));
                        this.savebutton=false;
                        this.displayEditEmail=false;
                        this.isBlockNone="block";
                        this.ResendOtp();
                     }
                     else{
                        this.userExistsErrors=true;
                     }
                     
                  });
              }
              
            });
   
 }
    emaiEdit(){
        this.validation_message_hide="none";
        this.displayEditEmail=true;
        this.isBlockNone="none"
        this.savebutton=true;
    }
    Crossclick(){
        this.savebutton=false;
        this.displayEditEmail=false;
        this.isBlockNone="block";
        this.accountService.getConnectedUser().subscribe((user) => {
            this.newEmail=user.email;
        });
    }
public closeActivemodal(){
    this.activeModal.dismiss('Cross click');
    this.router.navigate([localStorage.getItem("lastprivious").toString()])
}

}

