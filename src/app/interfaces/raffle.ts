import { DateTimeModel } from './shared-models';
import { Moment } from 'moment';
import { ListViewFilters } from './list-view-models';
import { MinimalProductModel, RafflePackageModel } from './data-models';
import TwoRaffleHelpers from '../helpers/helpers';
import {SafeHtml} from "@angular/platform-browser";

export class RaffleShortModel {

  raffleId: number;
  raffleUniqueId: number;
  outOfTickets?: boolean;
  productImageUrl: string[] = [];
  productName: string;
  raffleName:string;
  raffleDate?: DateTimeModel;
  hideDay:boolean;
  ticketPrice: number;
  uniqueId: string;
// Client side only
  raffleMomentDate?: Moment;
  totalTickets : number;
  permitNumber : string;
  timedifference:number;
}

export class RaffleFullModel extends RaffleShortModel {
  hasEnded: true;
  raffleDateTime : Date;
  productDescription: string;
  productLegalNotes: string;
  src: string;
  raffleMomentDate?: Moment;
  territoryId?: number;
  product?: MinimalProductModel;
  ticketsAmount?: number;
  isPromoted?: boolean;
  isActive?: boolean;
  translations: RaffleTranslation[];
  rafflePackages: RafflePackageModel[];
  availableTickets: number;
  differenceHours:number;

  // Client only.
  safeProductDescription: SafeHtml;
  safeProductLegalNotes: SafeHtml;

  constructor() {
    super();
    this.translations = [];
  }

}

export class RaffleTranslation {
  languageId: number;
  productName: string;
  productDescription: string;
  productLegalNotes: string;
}

// Raffle Packages
export class RaffleFilters {
  territoryId: number;
  filters: ListViewFilters;
  showPast: boolean;
  raffleId: number;
  raffleDateStart: DateTimeModel;
  raffleDateEnd: DateTimeModel;
  uniqueId: string;
  productName: number;
}

export class WinningTicketDataModel {
  productName: string;
  hasFilledInformation: boolean;
}

export class WinningTicketDetailsModel {
  raffleId: string;
  ticketId: string;
  firstName: string;
  lastName: string;
  identification: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  phone: string;
}

export class RaffleDashboardRaffleModel {
  id:number;
  uniqueId: string ;
  raffleName:string;
  territoryId: number;
  productId:number;
  categoryId:number;
  raffleDate: Date ;
  ticketsAmount:number ;
  ticketPrice: number;
  isPromoted: boolean ;
  isActive: boolean ;
  createDate: Date;
  boughtTickets:number;
  winningTicketId: number;
  product:any;
  categories:any;
  raffleLanguages:any;
  raffleTickets:any;
}

// addons

export class  RaffleWinnerDto {
    raffleId : number;
	  raffleUniqueId : string;
		raffleName : string;
		productName : string;
		categoryName : string;
		winningRaffleTicketId : number;
	  winningRaffleTicketUniqueId : string;
		winnerUserId : number;
		winnerFirstName : string;
		winnerLastName : string;
		winnerEmail :string;
    IsWinnerOrNot:boolean;
}

export class UserRafflesFilters {
  userId: number;
  filters: ListViewFilters;
  raffleId: number;
  productName: string;
  raffleDateStart: DateTimeModel;
  raffleDateEnd: DateTimeModel;
  purchaseDateStart: DateTimeModel;
  purchaseDateEnd: DateTimeModel;
}

export class UserRafflesModel {
  territory: string;
  raffleId: number;
  raffleUniqueId:number;
  raffleName: string;
  product: string;
  ticketsCount: number;
  paymentsCount: number;
  didWin: boolean;
  raffleDate: Date;
  raffleDateModal: DateTimeModel;
  firstPaymentDate: DateTimeModel;
  firstPaymentDateModal: DateTimeModel;
  productImageUrl: string[];
  uniqueId: string;
  timedifference:number;
  
}

export class ListViewFilter {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
  sortColumn: string;
  sortDescending: boolean;
}

export class UserPurchaseModel
	{
		id:number;
		raffleName:string;
		purchaseDateTimeModel: DateTimeModel;
    purchaseDate : Date;
		package:string;
		cost:number;
    orderId;number
	}
