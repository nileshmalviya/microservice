// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FlipdownComponent } from './flipdown/flipdown.component';
import { HowToWinComponent } from './how-to-win/how-to-win.component';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { DailyDealsComponent } from './daily-deals/daily-deals.component';
import { AppRoutingModule } from '../app-routing.module';
import { RafflesSwiperComponent } from './raffles-swiper/raffles-swiper.component';
import { HowToWinComponentNew } from './how-to-win-new/how-to-win-new.component';

@NgModule({
  declarations: [
    FlipdownComponent,
    RafflesSwiperComponent,
    HowToWinComponent,
    DailyDealsComponent,
    HowToWinComponentNew
  ],

  imports: [
    CommonModule,
    TranslateModule,
    SwiperModule,
    AppRoutingModule
  ],

  exports: [
    FlipdownComponent,
    RafflesSwiperComponent,
    TranslateModule,
    HowToWinComponent,
    DailyDealsComponent,
    HowToWinComponentNew
  ],

  providers: []
})
export class SharedModule { }
