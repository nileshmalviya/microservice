import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AppConfig } from 'src/app/services/app.config';
import { MainService } from 'src/app/services/main.service';
import { HowToWinItem, ITEMS } from './items-mock';

@Component({
  selector: 'app-how-to-win-new',
  templateUrl: './how-to-win-video-new.component.html'
})

export class HowToWinComponentNew implements OnInit {
  public items: HowToWinItem[] = ITEMS;
  public selectedItem: HowToWinItem;
  private nextSelectedItem: HowToWinItem;

  // @ViewChild('video') video: ElementRef;
    @ViewChild('raffles') rafflesRef: ElementRef;
    public ShowVideoImg:boolean;
  constructor(
    private mainService : MainService
  
   ) {
  }

  ngOnInit(): void {
this.isWifiConneted();
  }

  public howToWin_over(e: Event, item: HowToWinItem): void {
    this.nextSelectedItem = item;

    setTimeout(() => {
      this.selectedItem = item;
      this.nextSelectedItem = null;
      // this.video.nativeElement.load();
      // this.video.nativeElement.play();
    }, 100);
  }

  public howToWin_out(e: Event, item: HowToWinItem): void {
    setTimeout(() => {
      if ((this.selectedItem?.id === item.id) && !this.nextSelectedItem) {
        this.selectedItem = null;
      }
    }, 100);
  }
    public scroll(): void {
    this.rafflesRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
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
    //   if(!speed){
    //     this.ShowVideoImg=false;
    //     console.log("imgage" );
    //   }else{
    //     this.ShowVideoImg=true;
    //     console.log("video");
    //   }


  }

}


