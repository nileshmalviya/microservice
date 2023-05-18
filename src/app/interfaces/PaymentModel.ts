export class PaymentModel{
  amount:string;
  currency:string = "MXN";
  userID:string;
  userUniqueId:string;
  email:string;
  countryCode:string = "MX";
  firstName:string;
  lastName:string;
  orderRequest:string;
  orderResponse:string;
  paymentStatusRequest:string;
  paymentStatusResponse:string;
}
