import { response } from 'express';
import { AccountService } from 'src/app/services/account.service';
import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'app-my-raffles',
    templateUrl: './my.raffles.component.html',
    styleUrls: ['./my.raffles.component.scss']
  })

  export class MyRafflesComponent implements OnInit {
    currentUser:any;
    constructor(public accountService: AccountService) { }

    ngOnInit(): void {
      this.currentUser = this.accountService.getConnectedUserSync();
    }

    ngOnDestroy(){
      if(this.currentUser != null || this.currentUser != undefined){
        this.accountService.IsUserBlock(this.currentUser.id).subscribe(response => {
          if(response.result){
            this.accountService.userBlockEvent.emit(response.data);
          }
        }, (error)=>{
          console.log("error:: ",error);
          this.accountService.checkErrorResponse(error);
        })
      }
    }

}
