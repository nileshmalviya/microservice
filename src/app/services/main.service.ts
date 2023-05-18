import {Injectable, Output} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ServerResponse} from '../interfaces/server-response';
import {ClientLanguageModel} from '../interfaces/client-models';
import {StorageKeys} from '../models/storage-keys';
import {RaffleDashboardRaffleModel, RaffleFilters, RaffleFullModel, RaffleShortModel, RaffleWinnerDto, UserPurchaseModel, UserRafflesFilters, UserRafflesModel, WinningTicketDataModel, WinningTicketDetailsModel} from '../interfaces/raffle';
import TwoRaffleHelpers from '../helpers/helpers';
import {HomeDataModel, RafflePackageModel} from '../interfaces/data-models';
import {BaseService} from './base.service';
import {map} from 'rxjs/operators';
import { ListViewResults } from '../interfaces/list-view-models';
import { CountryDataModel, UserDataModel, UserInfoDataModel} from '../interfaces/user-model';
import { EventEmitter } from 'events';
import {SpeedTestService} from 'ng-speed-test';
import { AppConfig } from './app.config';
@Injectable({
    providedIn: 'root'
})

export class MainService extends BaseService {
    public languageUpdated: Subject<ClientLanguageModel>;
    public historyPanelToggleUpdate: Subject<boolean>;

    private homeData: HomeDataModel = null;

    private selectedLanguage: ClientLanguageModel;
    public messageSource = new BehaviorSubject('default message');
    public currentMessage = this.messageSource.asObservable();
    public  internetspeed:number;

    public  EventEmitter = require('events');
    public raffleStatus = new EventEmitter();

    constructor(
        protected http: HttpClient,
        protected router: Router,
        protected translate: TranslateService,
        private speedTestService:SpeedTestService
    ) {
        super(http);

        this.languageUpdated = new Subject<ClientLanguageModel>();
        this.historyPanelToggleUpdate = new Subject<boolean>();
    }

    public getHomeData(force: boolean = false): Observable<HomeDataModel> {
        const result = new Subject<HomeDataModel>();
        var offset = TwoRaffleHelpers.getUTCTimeDifference();
        if (!this.homeData || force) {
            this.get(`Home/GetHomeData`)
                .subscribe((response: any) => {
                    response.data.raffles.map((raffle: RaffleFullModel) => {
                        raffle.raffleMomentDate = TwoRaffleHelpers.getMomentFromDateTimeModel(TwoRaffleHelpers.convertUTCtoLocal(raffle.raffleDateTime));
                        //raffle.raffleDate = TwoRaffleHelpers.convertUTCtoLocal(raffle.raffleDateTime);
                        for(let index in  raffle.productImageUrl){
                          if(raffle.productImageUrl[0] === 'no image') {
                            raffle.productImageUrl[0] = 'no image';
                            continue;
                          }
                          raffle.productImageUrl[index] = this.getServerResourceUrl( raffle.productImageUrl[index]);
                        }
                        // raffle.productImageUrl = this.getServerResourceUrl(raffle.productImageUrl);
                        return raffle;
                    });

                    this.homeData = response.data;

                    result.next(this.homeData);
                    result.complete();
                });
        } else {
            setTimeout(x => {
                result.next(this.homeData);
                result.complete();
            });
        }

        return result;
    }

    public getHomeDataSync(): HomeDataModel {
        return this.homeData;
    }

    // **************************************************************** //
    // *************************** Raffles ****************************** //
    // **************************************************************** //
    public getRaffle(id: string): Observable<ServerResponse<RaffleFullModel>> {
         var raffleUniqueId = id;
        const url = `Home/GetRaffleData/${raffleUniqueId}`;
        return this.get<RaffleFullModel>(url)
            .pipe(map((response) => {
                response.data.raffleDate = TwoRaffleHelpers.convertUTCtoLocal(response.data.raffleDateTime);
                if (response.result && response.data) {
                    // response.data.productImageUrl = this.getServerResourceUrl(response.data.productImageUrl);
                    for(let index in  response.data.productImageUrl){
                      if(response.data.productImageUrl[0] === 'no image') {
                        response.data.productImageUrl[0] = "no image";
                        continue;
                      }
                      response.data.productImageUrl[index] = this.getServerResourceUrl( response.data.productImageUrl[index]);
                    }
                }

                return response;
            }));
    }

    public isUserVerified(id: number): Observable<ServerResponse<any>> {
        var UserId = id;
        const url = `Account/CheckUserIsValidatedOrNot/${UserId}`;
        return this.get<ServerResponse<any>>(url);

    }

    // Crate Package ticket (New change)
    public buyTickets(data:any): Observable<ServerResponse<boolean>> {
        const url = `Payments/MakePurchase`;
        const body = data;
        return this.post<boolean>(url,body);
       // return this.post<boolean>(url, body);
    }
    // public buyTickets(raffleUniqueId: string, packageId: number): Observable<ServerResponse<boolean>> {
    //     const url = `Game/BuyTickets`;
    //     const body = {raffleUniqueId, packageId};
    //     return this.post<boolean>(url, body);
    // }

    public getWinningTicket(raffleId: string, ticketId: string): Observable<ServerResponse<WinningTicketDataModel>> {
        const url = `Game/GetWinningTicket/?raffleId=${raffleId}&ticketId=${ticketId}`;
        return this.get<WinningTicketDataModel>(url);
    }

    public updateWinningTicketDetails(details: WinningTicketDetailsModel): Observable<ServerResponse<any>> {
        const url = `Game/UpdateWinningTicketDetails`;
        const body = details;
        return this.post<any>(url, body);
    }

    public getMyRaffles(details: UserRafflesFilters): Observable<ServerResponse<ListViewResults<UserRafflesModel>>> {
        const url = `Users/GetUserRaffles`;
        const body = details;
        return this.postWithAuth<ListViewResults<UserRafflesModel>>(url,body);
        //return this.post<ListViewResults<UserRafflesModel>>(url, body);
    }

    public getMyPurchases(userId: number,pageSize:number): Observable<ServerResponse<ListViewResults<UserPurchaseModel>>> {
        const url = `Payments/GetPaymentByUserId/${userId}/${pageSize}`;
        return this.getWithAuth<ListViewResults<UserPurchaseModel>>(url);
       // return this.get<ListViewResults<UserPurchaseModel>>(url);
    }

    public getLoggedInUserData(userId: number): Observable<ServerResponse<UserDataModel>> {
        const url = `Users/GetUserById/${userId}`;
        return this.getWithAuth<UserDataModel>(url);
    }

    public getPersonalUserInfoData(userId: number): Observable<ServerResponse<UserInfoDataModel>> {
        const url = `Users/GetUserPersonalDetailsByUserId/${userId}`;
        return this.getWithAuth<UserInfoDataModel>(url);
    }

    public UpdateLoggedInUserData(details: UserDataModel): Observable<ServerResponse<UserDataModel>> {
        const url = `Users/SaveUser`;
        const body = details;
        return this.postWithAuth<UserDataModel>(url, body);
    }

    public UpdateLoggedInUserPersonalData(details: UserInfoDataModel): Observable<ServerResponse<UserInfoDataModel>> {
        const url = `Users/UpdateUserPersonalDetails`;
        const body = details;
        return this.postWithAuth<UserInfoDataModel>(url, body);
    }

    public getAllCountryData(): Observable<ServerResponse<any>> {
        const url = `Users/GetAllCountries`;
        return this.getWithAuth<any>(url);
    }

    // **************************************************************** //
    // *************************** Local ****************************** //
    // **************************************************************** //

    public getSavedLanguage(): number {
        let languageId: number = null;

        const languageIdStr = localStorage.getItem(StorageKeys.language);
        if (languageIdStr) {
            languageId = Number(languageIdStr);
        }

        return languageId;
    }

    public getSelectedlanguage(): ClientLanguageModel {
        return this.selectedLanguage;
    }

    public setSelectedLanguage(language: ClientLanguageModel): void {
        this.selectedLanguage = language;
        this.languageUpdated.next(this.selectedLanguage);
    }

    // **************************************************************** //
    // ************************** Helpers ***************************** //
    // **************************************************************** //

    public getRafflePackages():RafflePackageModel[]{
        var pckList : RafflePackageModel[] = [];

        var pck1 = new RafflePackageModel();
        pck1.id = 1;
        pck1.name = "package 20 entries (tickets)";
        pck1.percentageDiscount = 0;
       // pck1.price = 10;
        pck1.price = 200;
        pck1.ticketsNumber = 20;
        pckList.push(pck1);

        var pck2 = new RafflePackageModel();
        pck2.id = 2;
        pck2.name = "package  125 entries (tickets)";
        pck2.percentageDiscount = 0;
        //pck2.price = 25;
        pck2.price = 500;
        pck2.ticketsNumber =  125;
        pckList.push(pck2);

        var pck3 = new RafflePackageModel();
        pck3.id = 3;
        pck3.name = "package 500 entries (tickets)";
        pck3.percentageDiscount = 0;
        //pck3.price = 50;
        pck3.price = 999;
        pck3.ticketsNumber = 500;
        pckList.push(pck3);

        var pck4 = new RafflePackageModel();
        pck4.id =4;
        pck4.name = "package 1200 entries (tickets)";
        pck4.percentageDiscount = 0;
        //pck4.price = 100;
        pck4.price = 1999;
        pck4.ticketsNumber = 1200;
        pckList.push(pck4);

        var pck5 = new RafflePackageModel();
        pck5.id = 5;
        pck5.name = "package 2000 entries (tickets)";
        pck5.percentageDiscount = 0;
        //pck5.price = 150;
        pck5.price = 2999;
        pck5.ticketsNumber = 2000;
        pckList.push(pck5);

        return pckList;

    }

    public getRafflesForWinner(month, year,userId): Observable<ServerResponse<ListViewResults<RaffleWinnerDto>>>{
      return this.get<ListViewResults<RaffleWinnerDto>>(`Service/GetRafflesWithWinnerDetails/${month}/${year}/${userId}`);
    }
    //  public getRafflesForWinner(filters: RaffleFilters): Observable<ServerResponse<ListViewResults<RaffleDashboardRaffleModel>>> {
    //         return this.post<ListViewResults<RaffleDashboardRaffleModel>>(`Raffles/GetAllRaffleByFilters`, filters);
    // }

    public GeneratePayment(details:any): Observable<ServerResponse<any>> {
      const url = `Payments/GeneratePaymentOrder`;
      const body = details;
      return this.post<any>(url, body);
    }

    public updatePayment(details:any): Observable<ServerResponse<any>> {
      const url = `Payments/UpdatePaymentDetail`;
      const body = details;
      return this.post<any>(url, body);
    }

    public getPaymentStatus(details:any): Observable<ServerResponse<any>> {
      const url = `Payments/GetPaymentStatus`;
      const body = details;
      return this.postWithAuth<any>(url, body);
    }

    public  isWificonnected(){
         return this.speedTestService.getMbps(
             {
                 iterations:1,
                 retryDelay:500
             }
             
         )
    }
}
