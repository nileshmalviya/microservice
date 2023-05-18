import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { RafflesComponent } from './pages/raffles/raffles.component';
import { RaffleComponent } from './pages/raffle/raffle.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { GamblingComponent } from './pages/gambling/gambling.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { HowToComponent } from './pages/how-to/how-to.component';
import { OddsCalculatorComponent } from './pages/odds-calculator/odds-calculator.component';
import { ServicesComponent } from './pages/services/services.component';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';
import { PolicyComponent } from './pages/policy/policy.component';
import {CongratulationsComponent} from './pages/congratulations/congratulations.component';
import { WinnerComponent } from './pages/winners/winner-component';
import {MyPurchaseComponent} from './pages/my-purchase/my.purchase.component';
import {MyRafflesComponent} from './pages/my-raffles/my.raffles.component'
import { MyAccountComponent } from './pages/my-account/my-account.component';

const routes: Routes = [
  /** Existing paths: */
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'raffles', component: RafflesComponent },
  { path: 'raffle/:id', component: RaffleComponent },
  { path: 'responsibleRaffle', component: GamblingComponent },
  { path: 'contact', component: ContactsComponent },
  { path: 'how-to', component: HowToComponent },
  { path: 'odds-calculator', component: OddsCalculatorComponent },
  { path: 'policy', component: PolicyComponent },
  { path: 'terms-of-use', component: TermsOfUseComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'congratulations/:ticketId', component: CongratulationsComponent },
  { path: 'winner', component: WinnerComponent  },
  //{ path: 'my-raffles', component: MyRafflesComponent  },
  // { path: 'my-account/my-purchases', component:MyAccountComponent},
  // { path: 'my-account/my-raffles', component:MyAccountComponent},
  { path: 'my-account/:tabID', component:MyAccountComponent},
  /** Redirects: */
  { path: 'raffle/:id/paymets/:package', component: RaffleComponent },
  //  to home in case of empty url
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // for staging
  { path: 'client/home', redirectTo: 'home', pathMatch: 'full' },

  // to PageNotFound in case of non-existent path
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      scrollPositionRestoration: 'enabled', // displaying top page position after redirect
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
