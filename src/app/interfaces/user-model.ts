import { MinimalTerritoryModel } from './data-models';
import { DateTimeModel } from './shared-models';

export interface ConnectedUserModel {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  tokenResult:string;
  selectedLanguage:string;
  territories: MinimalTerritoryModel[];

  // Client Only
  fullName: string;
}

export class UserDataModel {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  password: string;
  phone: string;
  country:string;
}

export class ChangePasswordData {
  id: number;
  oldPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}

export class UserInfoDataModel {
  id:number;
  countryId:number;
  country:string;
  userId:number;
  state:string;
  city:string;
  address:string;
  apartment:string;
  zipCode:string;
  phone:string;
  profileImageUrl:string;
}

export class CountryDataModel {
  id: number;
  name: string;
  dateCreated: DateTimeModel;
}

export class UserProfileImageUpload{
  userId: number;
  UserProfileImgFile: File;
}
