import { Component, OnInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { ListViewFilter, RaffleShortModel, UserRafflesFilters } from '../../interfaces/raffle';
import { MainService } from '../../services/main.service';
import TwoRaffleHelpers from '../../helpers/helpers';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { DateTimeModel } from 'src/app/interfaces/shared-models';

@Component({
  selector: 'app-my-raffles-swiper',
  templateUrl: './my-raffles-swiper.component.html',
  styleUrls: ['./my-raffles-swiper.component.scss']
})
export class MyRafflesSwiperComponent implements OnInit {
  public raffles: RaffleShortModel[];
  userRafflesFilters:UserRafflesFilters = new UserRafflesFilters();
  connectedUser: any;


  constructor(
    private mainservice: MainService,
    private accountService: AccountService,
    private route:ActivatedRoute
  ) {
    this.mainservice.currentMessage.subscribe(message =>{
      if(message === '0'){
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    this.connectedUser = this.accountService.getConnectedUserSync();
    if(this.connectedUser != null || this.connectedUser != undefined)
         this.getData();
 }

  public finishedHandler(event: any): void {
    console.log(event);
    this.getData();
  }

  private getRafflesCached(): void {
    var d = this.mainservice.getHomeDataSync().raffles;
    var rsmList: RaffleShortModel[] =[];
    d.forEach(element => {
        var d = new RaffleShortModel();
        d.outOfTickets = element.outOfTickets;
        // d.productImageUrl = element.productImageUrl.includes('no image') ? 'assets/images/noImageAvailable.png' :element.productImageUrl ;
        if(element.productImageUrl[0].includes('no image')){
          d.productImageUrl[0] = 'assets/images/noImageAvailable.png';
        }else{
          d.productImageUrl = element.productImageUrl;
        }
        d.raffleName = element.raffleName;
        d.raffleDate = element.raffleDate;
        d.ticketPrice = element.ticketPrice;
        d.uniqueId = element.uniqueId;
        rsmList.push(d);
      });
    this.raffles = rsmList;
  }
  
  private getRaffles(): void {
    this.getRafflesCached();
  }

  private getData() {
    this.raffles = [];
    var filters = new ListViewFilter();
    filters.sortColumn = 'id';
    filters.pageIndex = 0;
    filters.pageSize = 1000;
    filters.searchTerm = '';
    filters.sortDescending = true;
    this.userRafflesFilters.filters = filters;
    this.userRafflesFilters.userId =  this.connectedUser.id
     this.mainservice.getMyRaffles(this.userRafflesFilters).subscribe((res)=>{

         if(res.result){
          var rsmList: RaffleShortModel[] =[];
            res.data.data.forEach((ele)=>{
              var diff  = new Date();
              diff.setSeconds(diff.getSeconds() +ele.timedifference);
              ele.raffleDateModal = TwoRaffleHelpers.convertUTCtoLocal(diff);

              var d = new Date(diff);
                var myRaffle = new RaffleShortModel();
               var offset = TwoRaffleHelpers.getUTCTimeDifference();

                // if(offset[0] == 'p'){
                //     d.setHours(d.getHours() + parseInt(offset.substring(1).split(":")[0]));
                //     d.setMinutes(d.getMinutes() + parseInt(offset.substring(1).split(":")[1]));
                // }else {
                //     d.setHours(d.getHours() - parseInt(offset.substring(1).split(":")[0]));
                //     d.setMinutes(d.getMinutes() - parseInt(offset.substring(1).split(":")[1]));
                // }

                if(d >= new Date()){
                ele.raffleDateModal.day = d.getDate();
                ele.raffleDateModal.month = d.getMonth() ;
                ele.raffleDateModal.year = d.getFullYear();
                ele.raffleDateModal.hour = d.getHours();
                ele.raffleDateModal.minute = d.getMinutes();
                //push data on new object
                myRaffle.raffleId = ele.raffleId;
          //       var current = new Date();
          //     var r = new Date(d);
          //     var diff1 = r.valueOf() - current.valueOf();
          //   var diffInMins = diff1/1000/60;
          //   var offset = TwoRaffleHelpers.getUTCTimeDifference();
          //   var v = parseInt(offset.substring(1).split(":")[0])*60+parseInt(offset.substring(1).split(":")[1]);
          //   if(offset[0] == 'p'){
          //   diffInMins = diffInMins + v;
          //  } else {
          //   diffInMins = diffInMins - v;
          //  }
           var diffInHours = ele.timedifference / (60*60);
              myRaffle.hideDay = diffInHours<=23.99;
              //  ele.productImageUrl = this.mainservice.getServerResourceUrl(ele.productImageUrl);
              for(let index in  ele.productImageUrl) {
                if(ele.productImageUrl[0] === 'no image') {
                  ele.productImageUrl[0] = 'assets/images/noImageAvailable.png';
                  continue;
                }
                ele.productImageUrl[index] = this.mainservice.getServerResourceUrl( ele.productImageUrl[index]);
              }

                // myRaffle.productImageUrl = ele.productImageUrl.includes('no image') ? 'assets/images/noImageAvailable.png' :ele.productImageUrl ;
                // if(ele.productImageUrl[0].includes('no image')){

                // }else{
                myRaffle.productImageUrl = ele.productImageUrl;
                // }
                myRaffle.raffleName = ele.raffleName;
                myRaffle.raffleDate = ele.raffleDateModal;
                myRaffle.uniqueId = ele.uniqueId;
                myRaffle.raffleUniqueId = ele.raffleUniqueId;
                rsmList.push(myRaffle);
              }
            })
             this.raffles = rsmList;

         }
     }, (error)=>{
      console.log("error:: ",error);
      this.accountService.checkErrorResponse(error);
  });
}

public formateDate(dateTime:DateTimeModel):any{
  const nth = function(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  }
  const date = dateTime.day;
    const month = [
      this.accountService.getKeyValue('January'),
      this.accountService.getKeyValue('February'),
      this.accountService.getKeyValue('March'),
      this.accountService.getKeyValue('April'),
      this.accountService.getKeyValue('May'),
      this.accountService.getKeyValue('June'),
      this.accountService.getKeyValue('July'),
      this.accountService.getKeyValue('August'),
      this.accountService.getKeyValue('September'),
      this.accountService.getKeyValue('October'),
      this.accountService.getKeyValue('November'),
      this.accountService.getKeyValue('December')
    ][dateTime.month];
  //const month = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"][dateTime.month];
  const hr = dateTime.hour>12?dateTime.hour-12:dateTime.hour;
  const hour = hr<10?"0"+hr:hr;
  const min = dateTime.minute<10?"0"+dateTime.minute:dateTime.minute;
  const ampm = dateTime.hour>12?"PM":"AM";
return date + nth(date)+" "+month+" "+dateTime.year +" "+hour+":"+min +" "+ampm ;
  }
}
