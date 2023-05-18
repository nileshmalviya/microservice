import { Component, NgModule, OnInit, ViewChild } from "@angular/core";
import { ListViewFilter, UserPurchaseModel, UserRafflesFilters, UserRafflesModel } from "src/app/interfaces/raffle";
import { ConnectedUserModel } from "src/app/interfaces/user-model";
import { MainService } from "src/app/services/main.service";
import {AccountService} from "src/app/services/account.service"
import { Observable } from "rxjs";
import { ServerResponse } from "src/app/interfaces/server-response";
import { DateTimeModel } from "src/app/interfaces/shared-models";
import TwoRaffleHelpers from "src/app/helpers/helpers";
import { RafflesModalService } from "src/app/services/raffles-modal.service";
import { ColumnMode, SortType } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-my-purchase',
    templateUrl: './my.purchase.component.html',
    styleUrls: ['./my.purchase.component.scss']
  })

  export class MyPurchaseComponent implements OnInit {

    connectedUser: ConnectedUserModel = null;
    rows = [
    ];
    totalCount = 10;
    SortType = SortType;
    offset = 0;

   // public userRafflesFilters:UserRafflesFilters = new UserRafflesFilters();
    // listFilters: ListViewFilter ;
     loggedInUserId :number = 0;
     dataSource : UserPurchaseModel[];



    constructor(private mainService: MainService,
                private accountService: AccountService,
                private modalService: RafflesModalService) {
    }


    ngOnInit(): void {
       this.connectedUser = this.accountService.getConnectedUserSync();
       if(this.connectedUser != null || this.connectedUser != undefined)
            this.getData();
        else
        this.modalService.openRegisterModal();
    }

    ngOnDestroy(){
      if(this.connectedUser != null || this.connectedUser != undefined){
        this.accountService.IsUserBlock(this.connectedUser.id).subscribe(response => {
          if(response.result){
            this.accountService.userBlockEvent.emit(response.data);
          }
        }, (error)=>{
          console.log("error:: ",error);
          this.accountService.checkErrorResponse(error);
        })
      }
    }

    public formateDate(dateTime:DateTimeModel):any{
        var day = dateTime.day<10?"0"+dateTime.day:dateTime.day;
        var mon = dateTime.month<10?"0"+dateTime.month:dateTime.month;
        return day+ "/" +mon+"/"+dateTime.year;
    }

    public formateTime(dateTime:DateTimeModel){
        const hr = dateTime.hour>12?dateTime.hour-12:dateTime.hour;
        const hour = hr<10?"0"+hr:hr;
        const min = dateTime.minute<10?"0"+dateTime.minute:dateTime.minute;
        const ampm = dateTime.hour>12?"PM":"AM";
        return hour+":"+ min +" "+ampm;
    }

    setPage(pageInfo) {
        this.offset = pageInfo.offset;
        this.getData();
      }

    private getData() {
         this.mainService.getMyPurchases(this.connectedUser.id,this.offset).subscribe((res)=>{
             console.log("res:: ",res);
             if(res.result){
                res.data.data.forEach((ele)=>{
                    var offset = TwoRaffleHelpers.getUTCTimeDifference();
                    var d = new Date(ele.purchaseDate);
                    if(offset[0] == 'p'){
                        d.setHours(d.getHours() + parseInt(offset.substring(1).split(":")[0]));
                        d.setMinutes(d.getMinutes() + parseInt(offset.substring(1).split(":")[1]));
                    }else {
                        d.setHours(d.getHours() - parseInt(offset.substring(1).split(":")[0]));
                        d.setMinutes(d.getMinutes() - parseInt(offset.substring(1).split(":")[1]));
                    }
                    ele.purchaseDate = d;
                    ele.purchaseDateTimeModel.day = d.getDate();
                    ele.purchaseDateTimeModel.month = d.getMonth() + 1;
                    ele.purchaseDateTimeModel.year = d.getFullYear();
                    ele.purchaseDateTimeModel.hour = d.getHours();
                    ele.purchaseDateTimeModel.minute = d.getMinutes();
                })

                 this.dataSource = res.data.data;
                 this.totalCount = res.data.dataCount;
             }
         }, (error)=>{
             console.log("error:: ",error);
             this.accountService.checkErrorResponse(error);
         }
         );
    }
}
