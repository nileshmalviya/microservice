import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/services/app.config';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-how-to',
  templateUrl: './how-to.component.html',
  styleUrls: ['./how-to.component.scss']
})
export class HowToComponent implements OnInit {
  public ShowVideoImg:boolean=false;
  public classforstep1_2:string;
  constructor(
    private mainService : MainService
   ) { }

  ngOnInit(): void {
    this.isWifiConneted();
  }

  
  private isWifiConneted()
  {
     this.mainService.isWificonnected().subscribe((speed)=>{
      if(speed < AppConfig.settings.internetspeed){
        this.ShowVideoImg=false;
        this.classforstep1_2="";
      }else{
        this.ShowVideoImg=true;
        this.classforstep1_2='';
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
