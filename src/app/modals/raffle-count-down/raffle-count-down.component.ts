import { response } from 'express';
import { AccountService } from './../../services/account.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { RaffleShortModel } from 'src/app/interfaces/raffle';
import { DateTimeModel } from 'src/app/interfaces/shared-models';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';

@Component({
  selector: 'app-raffle-count-down',
  templateUrl: './raffle-count-down.component.html',
  styleUrls: []
})
export class RaffleCountDownComponent implements OnInit {

  @Input() public raffles:any;
  public myRaffles = new RaffleShortModel();
  timer:number = 0;
  public raffleDateTimeModal = new DateTimeModel();
  public dbCallInterval: any;

  constructor(private activeModal: NgbActiveModal,
              private modalService: RafflesModalService,
              private accountServies:AccountService) { }

  ngOnInit(): void {
    this.getpopup(this.raffles);
  }

  public finishedHandler(event: any): void {
    console.log(event);
    this.getRaffleWinnerTicektId();
  }

  public getRaffleWinnerTicektId(){
      this.accountServies.getRaffleIdByWinningTicket(this.myRaffles.raffleId).subscribe(response =>{
        if(response.data == null){
          this.getRaffleWinnerTicektId();
          return;
        }
        if(response.result){
            this.activeModal.close();
            this.modalService.openWinnerModal(response.data);
      }
    });
  }

  public getpopup(raffles:any){
    var d = new Date(raffles.raffleDateTime);
   var offset = TwoRaffleHelpers.getUTCTimeDifference();

    if(offset[0] == 'p'){
        d.setHours(d.getHours() + parseInt(offset.substring(1).split(":")[0]));
        d.setMinutes(d.getMinutes() + parseInt(offset.substring(1).split(":")[1]));
    }else {
        d.setHours(d.getHours() - parseInt(offset.substring(1).split(":")[0]));
        d.setMinutes(d.getMinutes() - parseInt(offset.substring(1).split(":")[1]));
    }

    if(d >= new Date()){
        this.raffleDateTimeModal.day = d.getDate();
        this.raffleDateTimeModal.month = d.getMonth() ;
        this.raffleDateTimeModal.year = d.getFullYear();
        this.raffleDateTimeModal.hour = d.getHours();
        this.raffleDateTimeModal.minute = d.getMinutes();
        this.raffleDateTimeModal.second = d.getSeconds();
        //push data on new object
        this.myRaffles.raffleId = raffles.raffleId;
        var current = new Date();
        var r = new Date(d);
        var diff1 = r.valueOf() - current.valueOf();
        var diffInMins = diff1/1000/60;
        // var offset = TwoRaffleHelpers.getUTCTimeDifference();
        var v = parseInt(offset.substring(1).split(":")[0])*60+parseInt(offset.substring(1).split(":")[1]);
        if(offset[0] == 'p'){
        diffInMins = diffInMins + v;
      } else {
        diffInMins = diffInMins - v;
      }
        var diffInHours = diffInMins/60;
        this.myRaffles.hideDay = diffInHours<=23.99;
        this.myRaffles.raffleDate = this.raffleDateTimeModal;
    }
  }

}
