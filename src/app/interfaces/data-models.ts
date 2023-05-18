import { DateTimeModel, FileContainer } from './shared-models';
import { ListViewFilters } from './list-view-models';
import {RaffleFullModel} from "./raffle";

export class HomeDataModel {
  currency: CurrencyModel;
  languages: LanguageModel[];
  raffles: RaffleFullModel[];
}

export class MinimalLanguageModel {
  id: number;
  name: string;
}

export class LanguageModel extends MinimalLanguageModel {
  code: string;
  originalName: string;
}

// Currencies
export class MinimalCurrencyModel {
  id: number;
  name: string;
  mark: string;
}

export class CurrencyModel extends MinimalCurrencyModel {
  code: string;
  conversionRate: number;
}

// Categories
export class MinimalCategoryModel {
  id: number;
  name: string;
}

export class CategoriesDashboardCategoryModel extends MinimalCategoryModel {
  parentCategory: string;
  isActive: boolean;
  productCount: number;
}

export class CategoryModel extends MinimalCategoryModel {
  parentCategoryId: number;
  imageUrl: FileContainer;
  isActive: boolean;
  translations: CategoryTranslation[];

  constructor() {
    super();

    this.imageUrl = new FileContainer();
    this.translations = [];
  }
}

export class CategoryTranslation {
  languageId: number;
  name: string;
}

// Territories
export class MinimalTerritoryModel {
  id: number;
  name: string;
}

export class TerritoryDashboardTerritoryModel extends MinimalTerritoryModel {
  currency: string;
}

export class TerritoryModel extends MinimalTerritoryModel {
  currencyId: number;
  countryCodes: string;
  paymentSupplier: string;
  languageIds: number[];
  categories: TerritoryCategory[];

  constructor() {
    super();

    this.languageIds = [];
    this.categories = [];
  }
}

export class TerritoryCategory {
  categoryId: number;
  isActive: boolean;
  isPromoted: boolean;
}

// Products
export class MinimalProductModel {
  id: number;
  name: string;
}

export class ProductsDashboardProductModel extends MinimalProductModel {
  raffleCount: number;
  isActive: boolean;
}

export class ProductModel extends MinimalProductModel {
  price: number;
  notes: string;
  imageUrl: FileContainer;
  ticketsAmount: number;
  isActive: boolean;
  categories: number[];
  translations: ProductTranslation[];

  constructor() {
    super();

    this.imageUrl = new FileContainer();
    this.translations = [];
  }
}

export class ProductTranslation {
  languageId: number;
  name: string;
  description: string;
  legalNotes: string;
}


export class RafflePackagesDashboardRafflePackageModel {
  id: number;
  name: string;
  ticketsNumber: number;
  percentageDiscount: number;
  pricePerTicket: number;
  salesTotal: number;
}

export class RafflePackageModel {
  id: number;
  name: string;
  ticketsNumber: number;
  percentageDiscount: number;
  price: number;
}

// Payments
export class RafflePaymentsFilters {
  raffleId: number;
  filters: ListViewFilters;
  purchaseUniqueId: string;
  userId: number;
  userName: string;
  userEmail: string;
  purchaseDateStart: DateTimeModel;
  purchaseDateEnd: DateTimeModel;
}

export class RafflePaymentsDashboardPaymentModel {
  id: number;
  uniqueId: string;
  userId: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  currency: string;
  package: string;
  tickets: number;
  ticketPrice: number;
  ipAddress: string;
  isCanceled: boolean;
  createDate: DateTimeModel;
  cancelDate: DateTimeModel;
}

// -----------------------------------------------

export class RafflePaymentModel
	{
	raffleId:number;
	ticketsCount: number;
	userId : number;
  name: string;
  cardNumber: number;
  expiryDate: number;
  securityCode: number;
}

export class MarketingCampaignModel{
    userId : number;
    raffleId :number;
    source : string
    campaignId :string
    clickId : string
    fullUrl : string
    dyn1 : string
    dyn2 : string
    dyn3 : string
    dyn4 : string
    dyn5 : string
}

export class WinnerClaimModel{
  winningTicketId:string;
  userId: string;
  winnerClaimCode:string;
  winnerDetails:WinnerDetails;
}

export class WinnerDetails{
  id :number;
  firstName : string;
  lastName :string;
  idNumber :number;
  country :string;
  city :string;
  phoneNumber:string;
  address :string;
  zipCode :string;
  isReachedMaturity :boolean;
  isOpenAnonymousAcccount :boolean;
  createdDate : Date;
}