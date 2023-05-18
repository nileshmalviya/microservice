import { json, response } from 'express';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { Observable } from 'rxjs';
import TwoRaffleHelpers from '../helpers/helpers';
import { HomeDataModel } from '../interfaces/data-models';
import { RaffleShortModel } from '../interfaces/raffle';
import { ServerResponse } from '../interfaces/server-response';
import { AccountService } from './account.service';
import { BaseService } from './base.service';
import { RafflesModalService } from './raffles-modal.service';
import { ThisReceiver } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class SignalRService extends HttpClient {
  public data: HomeDataModel[];
  public bradcastedData: HomeDataModel[];
  public currentRaffleId:any = 0;
  public raffleCountDownPopUpIsRunning = false;

private hubConnection: signalR.HubConnection

  constructor(private modalService: RafflesModalService,
              private baseService: AccountService){
    super(null);
  }

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl(this.baseService.getServerUrl('Socket/Get'))
                            .build();

    this.hubConnection
      .start()
      .then((res) => console.log('Connection started',res))
      .catch(err => this.startConnection())
      
  }

  public addTransferChartDataListener = () => {
    this.hubConnection.on('transferchartdata', async (data) => {
      console.log("transfer data "+ JSON.stringify(data));
      if(data.raffles?.length > 0){
        
       // if(this.currentRaffleId != data.raffles[0].raffleId){
          this.currentRaffleId = data.raffles[0].raffleId;
          if(!this.raffleCountDownPopUpIsRunning){
            this.raffleCountDownPopUpIsRunning = true;
            this.getRaffleWinnerTicektId();
          }
        //}
      }
    });
  }

  public getRaffleWinnerTicektId(){
    this.baseService.getRaffleIdByWinningTicket(this.currentRaffleId).subscribe(response =>{
      console.log("winner id response => ", response);
      if(response.data == null || response.data <= 0){
        this.raffleCountDownPopUpIsRunning  = true;
        this.getRaffleWinnerTicektId();
        return;
      }
      if(response.result &&  response.data > 0){
        this.raffleCountDownPopUpIsRunning  = false;
          this.modalService.openWinnerModal(response.data);
    }
  });
}

  public broadcastChartData = () => {
    this.hubConnection.invoke('broadcastchartdata', this.data)
    .catch(err => console.log(err));
  }

  public addBroadcastChartDataListener = () => {
    this.hubConnection.on('broadcastchartdata', (data) => {
    })
  }

}

