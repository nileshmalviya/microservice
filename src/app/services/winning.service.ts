import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { ServerResponse } from '../interfaces/server-response';
import { WinnerClaimModel, WinnerDetails } from '../interfaces/data-models';

@Injectable({
  providedIn: 'root'
})
export class WinningService extends BaseService {
  baseUrl: any = "Service"

  constructor(
    protected http: HttpClient

  ) {
    super(http);
  }
  public winningCongratulation(data: any): Observable<ServerResponse<boolean>> {
    const url = this.baseUrl + "/SendWinnerClaimMailAndSave";
    const body = new WinnerClaimModel();
    body.userId = data.winner.winnerId;
    body.winningTicketId = data.winner.winningTicketId;
    body.winnerClaimCode = data.winner.winnerClaimCode;
    var winnerDetailsObj = new WinnerDetails();
    winnerDetailsObj.firstName = data.firstName;
    winnerDetailsObj.lastName = data.lastName;
    winnerDetailsObj.address = data.address;
    winnerDetailsObj.city = data.city;
    winnerDetailsObj.country = data.country;
    winnerDetailsObj.createdDate = new Date;
    winnerDetailsObj.idNumber = data.idNumber;
    winnerDetailsObj.isOpenAnonymousAcccount = data.isOpenAnonymousAcccount;
    winnerDetailsObj.isReachedMaturity = data.isReachedMaturity;
    winnerDetailsObj.zipCode = data.zipCode;
    winnerDetailsObj.phoneNumber= data.phoneNumber;
    body.winnerDetails = winnerDetailsObj;
    const re = this.post<boolean>(url, body);
    console.log(re);
    return re;
  }
  public getWinningYear(): Observable<any> {
    const url = this.baseUrl + "/GetYearsForWinner";
    const re = this.get<any>(url);
    return re;
  }
  public checkUserIsWinner(winnerId, userId,winningTicketId): Observable<any> {
    const url = this.baseUrl + "/CheckUserIsWinner";
    let obj = {
      winnerId,
      userId,
      winningTicketId
    }
    const re = this.post<any>(url, obj);
    return re;
  }

}
