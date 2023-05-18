import { Component, OnInit,ViewChild, ElementRef} from '@angular/core';
import { AppConfig } from 'src/app/services/app.config';
import { MainService } from 'src/app/services/main.service';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html'
})
export class PolicyComponent implements OnInit {
  @ViewChild('policyRaffles') rafflesRef: ElementRef;
 constructor( public accountService: AccountService, public modalService:RafflesModalService,
    private mainService : MainService) { }
public ShowVideoImg:boolean=false;
  ngOnInit(): void {
    this.isWifiConneted();
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
      // let speed = this.mainService.isWificonnected1();
      // if(!speed){
      //   this.ShowVideoImg=false;
      //   console.log("imgage" );
      // }else{
      //   this.ShowVideoImg=true;
      //   console.log("video");
      // }

    }
}
