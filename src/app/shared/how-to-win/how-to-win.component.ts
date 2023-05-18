import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HowToWinItem, ITEMS } from './items-mock';

@Component({
  selector: 'app-how-to-win',
  templateUrl: './how-to-win-video.component.html'
})

export class HowToWinComponent implements OnInit {
  public items: HowToWinItem[] = ITEMS;
  public selectedItem: HowToWinItem;
  private nextSelectedItem: HowToWinItem;

  // @ViewChild('video') video: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
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

}
