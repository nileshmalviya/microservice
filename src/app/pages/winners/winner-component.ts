import { Component, Input, ElementRef, OnInit, ViewChild, SimpleChange } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MainService } from 'src/app/services/main.service';
import { map } from 'rxjs/operators';
import { RaffleFilters, RaffleWinnerDto } from 'src/app/interfaces/raffle';
import { ListViewResults } from 'src/app/interfaces/list-view-models';
import { WinningService } from 'src/app/services/winning.service';
import { AccountService } from '../../services/account.service';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';
import { AppConfig } from 'src/app/services/app.config';


@Component({
    selector: 'app-winners',
    templateUrl: './winner-component.html'
})


export class WinnerComponent implements OnInit {
    @Input() fordropdownValue:string;
    public ShowVideoImg:boolean;
    public userid:number=0;
    private months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    private filters: RaffleFilters;
    private homeData: any;
    status: boolean = false;
    public connectedUser:any;
    selectedYear = "";
    selectedMonth= "";
    winningYear = [];
    currentDate = new Date();
    displayedColumns: string[] = ['raffleId'];
    dataSource: RaffleWinnerDto[];
    data: string = "Test valie";
    public isLoading = true;
    @ViewChild('raffles') rafflesRef: ElementRef;
    selectedItem: number = 0;
    constructor(private mainService: MainService, private winningService: WinningService, public accountService: AccountService, public modalService:RafflesModalService) {
         this.isWifiConneted();
        this.homeData = this.mainService.getHomeDataSync();
        this.connectedUser = this.accountService.getConnectedUserSync();
        
        if(this.connectedUser!=null){
            this.userid= this.connectedUser.id;
            }
        else{
            this.userid=0
            }
        this.getWinnerList(this.currentDate.getMonth()+ 1, this.currentDate.getFullYear(),this.userid);
        this.getWinningYear();
    }
    ngOnInit(): void {
    }
    
    getWinningYear() {
        this.winningService.getWinningYear().subscribe(data => {
            this.winningYear = data.data
        })
    }
    getWinnerList(month, year,userId) {
        this.mainService.getRafflesForWinner(month, year,userId).subscribe((res) => {
          console.log("-res-",res);
          const result = JSON.parse(JSON.stringify(res.result))
            if (result == true) {
                console.log("Wimners list ", res.data);
                if (res.data.dataCount > 0) {
                    this.isLoading = false;
                    this.dataSource = res.data.data;
                }
            }else{
                this.dataSource = null;
                this.isLoading = false;
            }
            this.selectedYear = year;
            console.log("==========",month);
            this.selectedMonth = this.months[month -1];
        });
    }
    listClick(event, newValue) {
        this.rafflesRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log("-------",newValue);
    this.selectedItem = newValue  ? newValue: 0;  // don't forget to update the model here
    // ... do other stuff here ...
}
    scroll(): void {
        this.rafflesRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    private isWifiConneted()
    {
       this.mainService.isWificonnected().subscribe((speed)=>{
        if(speed < AppConfig.settings.internetspeed){
          this.ShowVideoImg=false;
        }else{
          this.ShowVideoImg=true;
        }
      });
     }
}
