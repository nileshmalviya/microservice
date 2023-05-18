import { PaymentModel } from './../../interfaces/PaymentModel';
import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {RaffleFullModel} from '../../interfaces/raffle';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {AccountService} from '../../services/account.service';
import {HomeDataModel, RafflePackageModel, RafflePaymentModel} from '../../interfaces/data-models';
import {MainService} from '../../services/main.service';
import {RafflesModalService} from '../../services/raffles-modal.service';
import { NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import { ToastrService } from 'ngx-toastr';
import { PixelService } from 'ngx-pixel';
import { response } from 'express';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/services/app.config';


@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styles: [],
})
export class PaymentModalComponent implements OnInit {
  @ViewChild('agecheck', {read: ElementRef, static:false})agecheck:ElementRef; 
  @ViewChild('email2', { read: ElementRef, static:false }) namebutton: ElementRef;
  @ViewChild('cvvNumber',{read: ElementRef, static:false}) cvvNumber: ElementRef;
  @Input() public raffle: RaffleFullModel;
  @Input() public selectedPackage: RafflePackageModel;
  
  declare  window: any;
  private currentUser: ConnectedUserModel;
  private homeData: HomeDataModel;
  public reachedMaturity: boolean;
  public acceptAnonymousAccount: boolean;
  public cardName: string;
  public cardNumber: number;
  public expDate: number;
  public securityCode: string;
  public isProcesssing:boolean = false;
  public ageCheckbox:boolean = false;
  public isSubmitting: boolean;
  public loading:boolean = false;
  public isvalidEmail:boolean;
  pckList: RafflePackageModel[];
  public previousUrl:string;
  public signUpURL:boolean;
  public orderResponse:string;
  public paymentStatusRequest:string;
  public paymentStatusResponse:string;
  public selectedLanguageGlobal:string;
  public UpdateOrderRequest:string;
  public UpdateOrderResponse:string; 
  public IsUpdateCall:string;
  //public abc:RafflePackageModel;
  PackageId: number;
  ticketNumber: number;
  price:string;
  public updateTicketIsPending:boolean = true;
  public isCheckBoxValid:boolean = false;
  public validCount:number = 0;
  public yearValidationMessage:string = this.accountService.getKeyValue('required');
  public yearValidation:boolean = false;
  public nameValidation:boolean = false;
  public connectedUser: ConnectedUserModel;
  public userIdOnPurchase : number = 0;
  public UserEmailValidation: string="";
  public UserIsBlocked:boolean=false;
  //userExistsErrors: boolean = false;
  // On purchase registration details 
  public newUserId:number = 0;
  public newEmail: string = '';
  public emailRequired :boolean = false;

  nameValidationMessage:string = this.accountService.getKeyValue('required');


  constructor(private accountService: AccountService,
              private mainService: MainService,
              public activeModal: NgbActiveModal,
              public modalService: RafflesModalService,
              private toastr: ToastrService,
              private pixel: PixelService,
              private router:Router
              ) { }
  ngOnInit(): void {
   this.previousUrl= this.router.url;
    //this.router.navigate([this.raffle.raffleId,"\paymets",this.selectedPackage.ticketsNumber]);
    this.router.navigate(["/raffle",this.raffle.uniqueId,"\paymets",this.selectedPackage.ticketsNumber]);
    this.currentUser = this.accountService.getConnectedUserSync();
    this.homeData = this.mainService.getHomeDataSync();
    this.pckList = this.mainService.getRafflePackages();
    this.selectedLanguageGlobal = AppConfig.settings.selectedlanguage.includes("en")?"en-US":"es-ES";
    this.PackageId=this.selectedPackage.id;
    this.ticketNumber=this.selectedPackage.ticketsNumber;
    this.price = this.selectedPackage.price.toString();
    this.connectedUser = this.accountService.getConnectedUserSync();
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
    this.connectedUser = connectedUser;
    });
  }

  public selectPackage(rafflePackage: RafflePackageModel): void {
    this.selectedPackage = rafflePackage;
    this.PackageId = rafflePackage.id;
    this.ticketNumber=rafflePackage.ticketsNumber;
    this.price = rafflePackage.price.toString();
    this.router.navigate(["raffle",this.raffle.uniqueId,"\paymets",this.selectedPackage.ticketsNumber]);
  }

  public getCurrency(): string {
    return this.homeData.currency.mark;
  }

  public myModel = ''
  // public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
  // public paymentCardNumber = [/[1-9]/,/\d/, /\d/,/\d/,' ',/[1-9]/,/\d/, /\d/,/\d/,' ',/[1-9]/,/\d/, /\d/,/\d/,' ',/[1-9]/,/\d/, /\d/,/\d/]
  public paymentCardNumber = [/[1-9]/,/[0-9]/, /\d/,/\d/,' ',/[0-9]/,/\d/,/\d/,/\d/,' ',/[0-9]/,/\d/,/\d/,/\d/,' ',/[0-9]/,/\d/,/\d/,/\d/]
  // public expirationDate = [/[1-9]/,/\d/,' ', '/' ,' ',/[1-9]/,/\d/,]
  // public expirationDate = [/[0-9]/,/\d/,' ', '/' ,' ',/[1-9]/,/\d/,]
  public expirationDate = () => {
    if(String(this.expDate)[0] === '0')return [/[01]/,/[1-9]/,' ', '/' ,' ',/[1-9]/,/\d/,]
    else return [/[01]/,/[0-2]/,' ', '/' ,' ',/[1-9]/,/\d/,]
  }

  public cvv = [/[0-9]/,/[0-9]/, /\d/,]

  public buyTickets(f: NgForm): void {
    setTimeout(() =>{
      if(!this.ageCheckbox){
        this.agecheck.nativeElement.classList.add('age-check-validation');
        return;
      }
      this.namebutton.nativeElement.classList.remove('animation');
  },300);
    this.pixel.track('InitiateCheckout', {
      content_name:'payment_button_event',
      status:true
    });
    if(this.currentUser != null || this.currentUser != undefined){
      this.accountService.IsUserBlock(this.currentUser.id).subscribe(response => {
      if(response.data){
        this.accountService.userBlockEvent.emit(response.data);
        this.activeModal.dismiss();
      }else{
        this.mainService.getRaffle(this.raffle.uniqueId).subscribe((res) =>{
          this.makePayment(f);
          // if(res.data.availableTickets >= this.ticketNumber){
          //   this.makePayment(f);
          // }else{
          //   this.toastr.info(this.accountService.getKeyValue('toastr_out_of_stock'));
          // }
        });
      }
      }, (error)=>{
        this.accountService.checkErrorResponse(error);
      })
    } else {
      this.mainService.getRaffle(this.raffle.uniqueId).subscribe((res) =>{
        this.makePayment(f);
        // if(res.data.availableTickets >= this.ticketNumber){
        //   this.makePayment(f);
        // }else{
        //   this.toastr.info(this.accountService.getKeyValue('toastr_out_of_stock'));
        // }
      });
    }
    this.namebutton.nativeElement.classList.remove('animation');
  }

  paymentForm(f: NgForm) {
    if(!this.updateTicketIsPending){
      return;
    }
    var data = new RafflePaymentModel();
    data.raffleId = this.raffle.raffleId;
    data.ticketsCount = this.ticketNumber;
    data.userId = this.currentUser == null || this.connectedUser == undefined ? this.userIdOnPurchase : this.currentUser.id;
     this.mainService.buyTickets(data)
    .pipe(finalize(() => {
      this.isSubmitting = false;
    }))
    .subscribe((response: ServerResponse<boolean>) => {
      if (response.result) {
        this.updateTicketIsPending = false;
        this.mainService.raffleStatus.emit('updateTickets');
      } else {
        setTimeout(() =>{
          this.updateTicketIsPending = true;
          this.paymentForm(f);
        },100);
      }
    }, (error)=>{
        setTimeout(() =>{
          this.updateTicketIsPending = true;
          this.paymentForm(f);
        },200);
        this.accountService.checkErrorResponse(error);
    });
  }
public ageCheckbox1(){
      setTimeout(() =>{
      if(this.ageCheckbox){
        this.agecheck.nativeElement.classList.remove('age-check-validation');
      }},300);
  
}
  public async makePayment(f:NgForm){
    if(this.isFormValid(f)){
        return;
    }
    this.isProcesssing = true;
    this.loading = true;
    f.form.disable();
    this.isSubmitting = true;
    //register 
    if(this.connectedUser == null || this.connectedUser == undefined){
      
       await this.quickRegustration(f);
    }
    else{
    var paymetData = new PaymentModel();
    paymetData.amount = this.price;
    paymetData.userID = this.currentUser.id.toString();
    paymetData.userUniqueId = this.currentUser.id.toString();
    paymetData.email = this.currentUser.email;
    paymetData.firstName = this.currentUser.firstName;
    paymetData.lastName = this.currentUser.lastName;
    paymetData.orderRequest= JSON.stringify(paymetData);
    this.mainService.GeneratePayment(paymetData).subscribe(res => {
        if(res.data.data.response.status === 0){
          var orderResponse= JSON.stringify(res.data.data);
          this.orderResponse=orderResponse.toString();
          this.initiatePayment(res.data.data.response,f,res.data.data.ipAddress);
        }else{
          this.isProcesssing = false;
          this.closeActiveModel(1);
        }
      })
    }
  }

  
  private initiatePayment(data:any , f:NgForm, ipAddress:string) {
    let expMonth = this.expDate.toString().substring(0,2);
    let expYear = 20 + this.expDate.toString().substring(5,7)
    const requestData={
        "sessionToken": data.sessionToken, // received from openOrder API
        "merchantId": data.merchantId, // as assigned by Nuvei
        "merchantSiteId": data.merchantSiteId, // as assigned by Nuvei
        "clientUniqueId": data.clientUniqueId,
        "paymentOption": {
          "card": {
            "cardNumber": f.controls['cardnumber'].value,
            "cardHolderName": f.controls['cardname'].value,
            "expirationMonth": expMonth,
            "expirationYear": expYear,
            "CVV": this.securityCode,
          },
            "deviceDetails":{
              "ipAddress":ipAddress
            }
        },
     }
   this.paymentStatusRequest= JSON.stringify(requestData).toString(); 
   const safeCharge = window.globalThis.SafeCharge ({
    env: 'int', // the Nuvei environment you’re running on
    sessionToken: data.sessionToken, // received from openOrder API
    merchantId: data.merchantId, // as assigned by Nuvei
    merchantSiteId : data.merchantSiteId // as assigned by Nuvei
    });
   safeCharge.createPayment({
      "sessionToken": data.sessionToken, // received from openOrder API
      "merchantId": data.merchantId, // as assigned by Nuvei
      "merchantSiteId": data.merchantSiteId, // as assigned by Nuvei
      "clientUniqueId": data.clientUniqueId,
      "paymentOption": {
        "card": {
          "cardNumber": f.controls['cardnumber'].value,
          "cardHolderName": f.controls['cardname'].value,
          "expirationMonth": expMonth,
          "expirationYear": expYear,
          "CVV": this.securityCode
        },
      },
      "deviceDetails":{
        "ipAddress":ipAddress
      }
    }, (res) => {
        let status = 'FAILED';
        let transctionid = res.transactionId;
        if(res.result === 'APPROVED') {
          status = 'SUCCESS';
          transctionid = res.transactionId;
          let obj=[{
            'transctionId': transctionid,
            'raffleId': this.raffle.raffleId
          }]
          //Event snippet for Website sale conversion page
          window['dataLayer'].push({
            event: 'conversion',
            send_to: 'AW-10860457333/Fwe5CNbI2L4DEPXa1boo',
            transaction_id: transctionid
          });
          this.closeActiveModel();
          this.pixel.trackCustom('Purchase', {
            content_name:'Purchase',
            value:this.price,
            currency:'MXN',
            status:true,
            contents:obj
          });
          this.paymentForm(f);
          var paymentStatusResponse1= JSON.stringify(res); 
          this.paymentStatusResponse=paymentStatusResponse1.toString();
          this.updatePaymentStatus(data, status, transctionid);
        }else{
          var paymentStatusResponse= JSON.stringify(res); 
          this.paymentStatusResponse=paymentStatusResponse.toString();
          this.closeActiveModel(1);
          this.updatePaymentStatus(data,status,transctionid);
        }
        f.form.enable();
        this.isProcesssing = false;
    });
  }

  private updatePaymentStatus(data:any , status:string ,transctionid:string){
    let dataUpdateRequest={
    data : data , 
    status : status,
    transctionid: transctionid
    }
    this.UpdateOrderRequest= JSON.stringify(dataUpdateRequest).toString();
    this.mainService.updatePayment({
      userId : data.clientUniqueId,
      paymentDate : Date.now,
      OrderId : data.orderId,
      status : status,
      amount :null,
      transactionId : transctionid,
      orderResponse : this.orderResponse,
      paymentStatusRequest:this.paymentStatusRequest,
      paymentStatusResponse:this.paymentStatusResponse,
      UpdatePaymentStatusRequest:this.UpdateOrderRequest
    }).subscribe(response =>{
      this.UpdateResponse(response,data.orderId);
    });
  }

  public UpdateResponse(response,orderId){
    let UpdatepaymentResponse= JSON.stringify(response).toString(); 
    this.mainService.updatePayment({
      UpdatePaymentStatusResponse: UpdatepaymentResponse,
      UpdatePaymentsStatus:true,
      OrderId : orderId
    }).subscribe(response =>{
    });
  }

  private isFormValid(f:NgForm):boolean{
    // if(this.reachedMaturity === true){
    //   document.getElementById('valid_checkbox').classList.remove("valid_checkbox");
    // }else{
    //   document.getElementById('valid_checkbox').classList.add("valid_checkbox");
    // }

    // if(this.acceptAnonymousAccount === true){
    //   document.getElementById('valid_checkbox1').classList.remove("valid_checkbox1");
    // }else{
    //   document.getElementById('valid_checkbox1').classList.add("valid_checkbox1");
    // }
    if(f.invalid){
     if((f.controls['userEmail'].value== undefined || f.controls['userEmail'].value== null || this.isvalidEmail) && this.accountService.connectedUser==null){
      this.namebutton.nativeElement.classList.add('animation');
      this.namebutton.nativeElement.classList.add('PaymentEmailField');
      setTimeout(()=>{
        this.namebutton.nativeElement.classList.remove('animation');
        this.namebutton.nativeElement.focus();
      },2000);
     }
      //TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return true;
    }
    if(f.controls['cardname'].value === undefined || f.controls['cardnumber'].value === undefined || f.controls['expDate'].value === undefined || f.controls['securityCode'].value === undefined || (!this.ageCheckbox && this.accountService.connectedUser==null)){
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
      return true;
    }
    if(this.cardDetailIsValid()){
      return true;
    }
    if(this.nameIsValid()){
      return true;
    }
    return false;
  }

  private closeActiveModel(status:number = 0){
    this.activeModal.dismiss();
    this.loading = false;
    if(status === 1){
      let modelRef = this.modalService.openPaymentFailedModal(this.raffle,this.selectedPackage);
      this.pixel.trackCustom('Payment Failed', {
        content_name:'Payment Failed',
        status:true
      });
    }else{
      let modelRef = this.modalService.openPaymentSuccessModal();
     if(this.signUpURL==true){
      this.router.navigate(["/Thankyou","SignUp"]) 
     }
     else{
      this.router.navigate(["/Thankyou"])  
     }
      
      this.pixel.trackCustom('Thankyou Page', {
        status:true
      });
    }
  }

  public cardDetailIsValid() :boolean{
    let revalue = false;
    let expYear = parseInt(this.expDate.toString().substring(5,7));
    let expMonth = parseInt(this.expDate.toString().split('/')[0]);
    let currentYear = parseInt(new Date().getFullYear().toString().substr(-2));
    let currentMonth = parseInt(new Date().getMonth().toString())+1;
    if(expYear < currentYear){
      revalue = true;
      this.yearValidationMessage = this.accountService.getKeyValue('Invalid_Year')
      this.yearValidation = true;
    }
   else if(expYear == currentYear){
      if(expMonth < currentMonth){
      revalue = true;
      this.yearValidationMessage = this.accountService.getKeyValue('Invalid_month')
      this.yearValidation = true;
      }
      else{
       this.yearValidation = false;
      }
    }
    else{
      this.yearValidation = false;
    }
    if(expYear>=currentYear && this.yearValidation==false){
      this.cvvNumber.nativeElement.focus();
    }
return revalue;
  }

  public checkBoxOfMaturityValidation(){
    setTimeout(()=>{
      if(this.reachedMaturity === true){
        document.getElementById('valid_checkbox').classList.remove("valid_checkbox");
      }else{
        document.getElementById('valid_checkbox').classList.add("valid_checkbox");
      }
    },10)
  }

  public checkBoxOfAcceptValidation(){
    setTimeout(()=>{
      if(this.acceptAnonymousAccount === true){
        document.getElementById('valid_checkbox1').classList.remove("valid_checkbox1");
      }else{
        document.getElementById('valid_checkbox1').classList.add("valid_checkbox1");
      }
    },10)
  }

  public onFocus(){
    this.pixel.track('AddPaymentInfo', {
      content_name:'AddPaymentInfo',
      status:true
    });
  } 

  public nameIsValid() : boolean{
    let revalue = false;
    let pattern = /\d/g;
    if(pattern.test(this.cardName)){
      revalue = false;
      this.nameValidationMessage = this.accountService.getKeyValue('Invalid_name');
      this.nameValidation = false;
    }else{
      this.nameValidation = false;
    }
    return revalue;
  }

  private async quickRegustration(f:NgForm){
     var object = {
      "email":f.controls["userEmail"].value,
      "selectedLanguage":localStorage.getItem("selectedLanguage")== null?this.selectedLanguageGlobal:localStorage.getItem("selectedLanguage"),
     }
  
     this.accountService.registerOnPurchase(object).subscribe(async (response)=>{
     if(response.error == 'User Already Exists !!'){
      this.accountService.IsUserBlock(response.data.userId).subscribe(res => {
        if(res.data){
          this.loading = false;
          f.form.enable();
          this.isProcesssing = false;
          this.UserIsBlocked=true;
          }
        else{
          this.paymentsOnRegistration(response,f);
          }},(error)=>{
            this.accountService.checkErrorResponse(error);
          });
        }
     else{
      this.paymentsOnRegistration(response,f);
     }
      });
  }

  private async paymentsOnRegistration(response,f){
    if(response.result){
       this.userIdOnPurchase = response.data.userId;
       var paymetData = new PaymentModel();
       paymetData.amount = this.price;
       paymetData.userID = response.data.userId.toString();
       paymetData.userUniqueId = response.data.userUniqueId.toString();
       paymetData.email = response.data.email;
       paymetData.firstName = response.data.firstName;
       paymetData.lastName = response.data.lastName;
       paymetData.orderRequest= JSON.stringify(paymetData);
       if(response.error == null || response.error == undefined){
         await this.accountService.generatePasswordOnPurchase(response.data).subscribe(res => {
          if(res.data){
          this.signUpURL=true;
          console.log("new password send on registerd  email !!");
          }
        })
      }

       await this.mainService.GeneratePayment(paymetData).subscribe(res => {
           if(res.data.data.response.status === 0){
            var orderResponse= res.data.data;
            this.orderResponse=JSON.stringify(orderResponse).toString(); 
             this.initiatePayment(res.data.data.response,f,res.data.data.ipAddress);
           }else{
             this.isProcesssing = false;
             this.closeActiveModel(1);
           }
         })
    }else{
        this.loading = false;
        f.form.enable();
        this.isProcesssing = false;
      }
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
        this.namebutton.nativeElement.classList.remove('PaymentEmailField');
      }
      else{
        if(String(email).length < 1){
          this.isEmailValid1 = false;
          this.namebutton.nativeElement.classList.add('PaymentEmailField');
        }
        else
        this.isvalidEmail=true;
        this.isEmailValid1 = true;
        this.namebutton.nativeElement.classList.add('PaymentEmailField');
      }
  };
  public validationForEmail(event){
    setTimeout(() =>{
     this.namebutton.nativeElement.classList.remove('animation');
  },300);
    
    let isValid =  String(event)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
      if(isValid==null || isValid==undefined){
      this.namebutton.nativeElement.classList.add('animation');
       }
  }
  public closeActiveModal(){
    this.activeModal.dismiss('Cross click');
    this.router.navigate(["raffle",this.raffle.uniqueId]);
    // if(window.location.href.includes("/paymets")){
    //    this.router.navigate([localStorage.getItem("lastprivious").toString()]);
    // }
    // else{
    //   this.router.navigate([this.previousUrl]);
    // }
  }
}
