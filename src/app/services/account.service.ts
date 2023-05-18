import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConnectedUserModel, UserProfileImageUpload } from '../interfaces/user-model';
import { ServerResponse } from '../interfaces/server-response';
import { StorageKeys } from '../models/storage-keys';
import { catchError, finalize } from 'rxjs/operators';
import { AppConfig } from './app.config';
import { ClientLanguageModel } from '../interfaces/client-models';
import { BaseService } from './base.service';
import { TranslationService } from './translation.service';
import { SocialAuthService } from 'angularx-social-login';
import { ContactModel } from '../models/contact-model';
import { MarketingCampaignModel } from '../interfaces/data-models';
import { SubscriberDataModel } from '../models/subscriber-model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class AccountService extends BaseService {
  public connectedUserChanged: Subject<ConnectedUserModel> = new Subject<ConnectedUserModel>();
  private baseUrl = 'Account';

  public passwordStrengthRegex: RegExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])([!@#\\$%\\^&\\*]*)(?=.{8,})');

  public idNumberRegex: RegExp = new RegExp('(?=.{8,})');
  public phoneNumberRegex: RegExp = new RegExp('^((\\+91-?)|0)?[0-9]{10}$');
  public zipCodeRegex: RegExp = new RegExp('(?=.{5,})');

  public connectedUser: ConnectedUserModel;
  public profileUrlPath: any;
  private connectedUserLoaded: boolean;
  private connectedUserRequested: any;
  public isPaymentCall:boolean = false;
  public userVerified:boolean = false;

  @Output() profileChangeEvent = new EventEmitter<any>();
  @Output() userBlockEvent = new EventEmitter<any>();

  constructor(
    private translate: TranslationService,
    protected http: HttpClient,
    private socialAuthService: SocialAuthService,private router: Router, private toastr: ToastrService
  ) {
    super(http);
  }

  public getConnectedUser(force: boolean = false): Observable<ConnectedUserModel> {
    const result = new Subject<ConnectedUserModel>();
    const url = `${this.baseUrl}/GetConnectedUser`;

    if (!this.connectedUserRequested || force) {
      this.connectedUserRequested = true;
      this.connectedUserLoaded = false;

      this.post<ConnectedUserModel>(url, {})
        .pipe(finalize(() => {
          result.complete();
          this.connectedUserLoaded = true;
        }))
        .subscribe((response: ServerResponse<ConnectedUserModel>) => {
          if (response.result) {
            this.updateConnectedUser(response.data);

            result.next(this.connectedUser);
          } else {
            result.error('');
          }
        }, (error) => {
          result.error(error);
        });
    } else {
      const connectedUserInterval = setInterval(() => {
        if (this.connectedUserLoaded) {
          clearInterval(connectedUserInterval);
          result.next(this.connectedUser);
          result.complete();
        }
      }, 100);
    }

    return result;
  }

  public register(email: string, password: string, rememberMe: boolean,selectedLanguage:string): Observable<ServerResponse<ConnectedUserModel>> {
    const url = `${this.baseUrl}/Register`;
    const body = { email, password, rememberMe,selectedLanguage };
    return this.post<ConnectedUserModel>(url, body);
  }

  public login(email: string, password: string, rememberMe: boolean): Observable<ServerResponse<ConnectedUserModel>> {
    const url = `${this.baseUrl}/Login`;
    const body = { email, password, rememberMe };
    return this.post<ConnectedUserModel>(url, body);
  }

  public socialLogin(email: string, firstName: string, lastName: string, password: string, rememberMe: boolean,externalProfileImageUrl:string,selectedLanguage:string): Observable<ServerResponse<ConnectedUserModel>> {
    const url = `${this.baseUrl}/GetTokenByEmail`;
    const body = { email, firstName, lastName, password, rememberMe,externalProfileImageUrl,selectedLanguage };
    return this.post<ConnectedUserModel>(url, body);
  }

  public getResetPasswordCode(email: string): Observable<ServerResponse<any>> {
    const url = `${this.baseUrl}/GetResetPasswordCode`;
    const body = { email };
    return this.post<any>(url, body);
  }

  public updateSelectedLanguage(UserId:number,SelectedLanguage: string): Observable<ServerResponse<any>> {
    const url = `${this.baseUrl}/updateLanguage`;
    const body = { UserId,SelectedLanguage };
    return this.postWithAuth<any>(url, body);
  }

  public getChangePassword(userPassword: Object): Observable<ServerResponse<any>> {
    const url = `${this.baseUrl}/ChangeUserPassword`;
    const body = userPassword;
    return this.post<any>(url, body);
  }

  public resetPassword(email: string, code: string, password: string): Observable<ServerResponse<any>> {
    const url = `${this.baseUrl}/ResetPassword`;
    const body = { email, password, code };
    return this.post<any>(url, body);
  }

  public logout(): Observable<ServerResponse<any>> {
    const url = `${this.baseUrl}/Logout`;
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUSer");
    localStorage.removeItem("selectedLanguage");
    this.clearLocalUserData();
    return this.post<any>(url, {});
  }

  // Active User
  public getConnectedUserSync(): ConnectedUserModel {
    return this.connectedUser;
  }

  public ValidateUser(data:any):Observable<ServerResponse<any>>{
    const url = `Account/ValidateUser`;
    return this.post<Observable<ServerResponse<any>>>(url, data);
  }

  public updateConnectedUser(user: ConnectedUserModel): void {
    this.connectedUser = JSON.parse(localStorage.getItem("currentUSer"));
    var selectedLanguage = localStorage.getItem("selectedLanguage");
    if (selectedLanguage) {
      this.translate.use(selectedLanguage)
    }

    //this.connectedUser = user;

    if (this.connectedUser) {
      this.connectedUser.fullName = this.connectedUser.firstName + ' ' + this.connectedUser.lastName;
      this.connectedUserChanged.next(this.connectedUser);
    }
  }

  public getServerUrl(url: string): string {
    return AppConfig.settings.apiServer + '/' + url;
  }

  private clearLocalUserData(): void {
    //this.socialAuthService.signOut();
    this.connectedUser = undefined;
    this.connectedUserChanged.next(this.connectedUser);
    location.reload();
    window.location.href = window.location.href
  }

  public contact(contactModel: ContactModel): Observable<ServerResponse<any>> {
    const url = `Service/SendUserQueryMailAndSave`;
    return this.post<any>(url, contactModel);
  }

  public saveMarketingCampaign(model: MarketingCampaignModel): Observable<ServerResponse<any>> {
    const url = `Users/SaveMarketingCampaign`;
    return this.post<any>(url, model);
  }

  public SaveSubscriberData(details: SubscriberDataModel): Observable<ServerResponse<SubscriberDataModel>> {
    const url = `NewsLetter/SaveNewsLetterSubscriberDetails`;
    const body = details;
    return this.post<any>(url, body);
  }

  public saveProfileImage(imageData: UserProfileImageUpload): Observable<ServerResponse<any>> {
    const url = `Users/SaveUserProfileImage`;
    const data = new FormData();
    data.append('UserId', JSON.stringify(imageData.userId));
    data.append('UserProfileImgFile', imageData.UserProfileImgFile);
    console.log("form data ",data);
    return this.postWithAuth<ServerResponse<any>>(url, data);
  }

  public getProfileImage(userId: number): Observable<ServerResponse<any>> {
    const url = `Users/GetUserProfileImageByUserId/${userId}`;
    return this.getWithAuth<ServerResponse<any>>(url);
  }

  getProfileImageOfUser(){
    const userId = this.getConnectedUserSync();
    if(userId != null || userId != undefined){
    this.getProfileImage(userId.id).subscribe(response =>{
      if(response.result){
      this.connectedUser['profileImageUrl'] = this.getServerUrl(response.data['profileImageUrl']);
      //   var url = response.data.profileImageUrl;
      //  const image = url == null || url == undefined ? "https://i.stack.imgur.com/34AD2.jpg" :  this.getServerUrl(response.data.profileImageUrl);
      //  this.profileChange(image);
      }
    })
  }
  }

  public profileChange(image: any){
     this.profileChangeEvent.emit(image);
  }

  public getProductName(productId: string): Observable<ServerResponse<any>> {
    const url = `Products/GetRaffleProductName/${productId}`;
    return this.getWithAuth<ServerResponse<any>>(url);
  }

  public checkErrorResponse(error:any){
    if(error.status == 401){
        this.logout().subscribe((res)=>{
           this.toastr.error(this.getKeyValue('toastr_session_is_expire'));
           this.router.navigate(["/home"]);
        });
    }
  }

  public IsUserBlock(id:any): Observable<ServerResponse<any>>{
    const url = `Users/userBlockOr/${id}`;
    return this.getWithAuth<ServerResponse<any>>(url);
  }

  public checkRestPassword(userId: any): Observable<any> {
    const url = `Account/CheckResetPasswordLinkIsValidatedOrNot`;
    const body = {userId};
    return this.post<any>(url, body);
  }

  public getRaffleIdByWinningTicket(raffleId: number): Observable<ServerResponse<any>> {
    return this.get<ServerResponse<any>>(`Service/GetRaffleIdByWinnerId/${raffleId}`);
  }

  public OtpVarification(UserID:string, otp:string): Observable<ServerResponse<ConnectedUserModel>> {
    //var userdata =localStorage.getItem("currentUSer");
    const url = `${this.baseUrl}/ValidateUser`;
    const body = { UserID,otp};
    return this.post<ConnectedUserModel>(url, body);
  }

  public resendOtp(Id:number, Email:string): Observable<ServerResponse<ConnectedUserModel>>
  {
    var userdata =localStorage.getItem("currentUSer");
    const url = `${this.baseUrl}/ResendOtp`;
    const body = { Id,Email};
    return this.post<ConnectedUserModel>(url, body);
  }

  public getKeyValue(key:string):string{
    return this.translate.stream(key);
  }

  public registerOnPurchase(body:any): Observable<ServerResponse<any>>{
    const url = `${this.baseUrl}/RegisterUserOnPurchase`;
    return this.post<ConnectedUserModel>(url, body);
  }

  public generatePasswordOnPurchase(body:any): Observable<ServerResponse<any>>{
    const url = `${this.baseUrl}/SendGeneratedPasswordByMail`;
    return this.post<ConnectedUserModel>(url, body);
  }

  public UpdateEmail(Id:any, Email:string): Observable<ServerResponse<ConnectedUserModel>>
  {
    const url = `Users/UpdateEmail`;
    const body = { Id,Email};
    return this.post<ConnectedUserModel>(url, body);
  }
}
