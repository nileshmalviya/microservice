import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppConfig } from 'src/app/services/app.config';
import { MainService } from 'src/app/services/main.service';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {
  @ViewChild('aboutRaffles') rafflesRef: ElementRef;
  public ShowVideoImg:boolean;
  constructor(
  
    private mainService : MainService,
    private modalService: RafflesModalService,
    public accountService: AccountService
  ) {
    this.isWifiConneted();
   }

  ngOnInit(): void {
    
  }

  public register(): void {
    this.modalService.openRegisterModal();
}
public scroll(): void {
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
      // let speed:boolean = this.mainService.isWificonnected1();
    
      // if(!speed){
      //   this.ShowVideoImg=false;
      //   console.log("imgage" );
      // }else{
      //   this.ShowVideoImg=true;
      //   console.log("video");
      // }

    }
}
