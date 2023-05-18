// Modules
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from './app-routing.module';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePoHttpLoader } from './helpers/translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { WinnerComponent } from './pages/winners/winner-component';
import { AboutComponent } from './pages/about/about.component';
import { RaffleComponent } from './pages/raffle/raffle.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { GamblingComponent } from './pages/gambling/gambling.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { HowToComponent } from './pages/how-to/how-to.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { OddsCalculatorComponent } from './pages/odds-calculator/odds-calculator.component';
import { AppConfig } from './services/app.config';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RafflesComponent } from './pages/raffles/raffles.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { TermsOfUseComponent } from './pages/terms-of-use/terms-of-use.component';
import { ServicesComponent } from './pages/services/services.component';
import { NewPasswordModalComponent } from './modals/new-password-modal/new-password-modal.component';
import { YouGotMailModalComponent } from './modals/you-got-mail-modal/you-got-mail-modal.component';
import { ThankYouModalComponent } from './modals/thank-you-modal/thank-you-modal.component';
import { CongratulationsComponent } from './pages/congratulations/congratulations.component';
import { LoaderComponent } from './components/loader/loader.component';
import {PaymentModalComponent} from './modals/payment-modal/payment-modal.component';
import {LoginModalComponent} from './modals/login-modal/login-modal.component';
import {SignUpModalComponent} from './modals/sign-up-modal/sign-up-modal.component';
import {ForgotPasswordModalComponent} from './modals/forgot-password-modal/forgot-password-modal.component';
import {ChangePasswordModalComponent} from './modals/change-password-modal/change-password-modal.component';
import {MyRafflesComponent} from './pages/my-raffles/my.raffles.component';
import {MyPurchaseComponent} from './pages/my-purchase/my.purchase.component';
import { SocialLoginModule, SocialAuthServiceConfig, FacebookLoginProvider } from 'angularx-social-login';
// import { GoogleLoginProvider } from 'angularx-social-login';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { MyRafflesSwiperComponent } from './shared/my-raffles-swiper/my-raffles-swiper.component';
import { AccountSettingComponent } from './pages/account-setting/account-setting.component';
import { CongratulationsModalComponent } from './modals/congratulations-modal/congratulations-modal.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PersonalInfoComponent } from './pages/personal-info/personal-info.component';

import { AppleSigninModule } from 'ngx-apple-signin';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { UserNotVerifiedModalComponent } from './modals/user-not-verified-modal/user-not-verified-modal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { NgImageSliderModule } from 'ng-image-slider';
import { RaffleCountDownComponent } from './modals/raffle-count-down/raffle-count-down.component';
import { WinnerModal } from './modals/winner-modal/winner-modal.component';
import { CountdownComponent } from './shared/count-down/count-down.component';
import { OtpModalComponent } from './modals/otp-varify-modal/otp-varify-modal.component';
import { OtpAwesomeModalComponent } from './modals/otp-awesome-modal/otp-awesome-modal.component';
import { PaymentFailedModalComponent } from './modals/payment-failed-modal/payment-failed-modal.component';
import { PixelModule } from 'ngx-pixel';
import { SpeedTestModule } from 'ng-speed-test';
export function initializeApp(appConfig: AppConfig): any {
  return () => appConfig.load();
}

export function createTranslateLoader(http: HttpClient): TranslatePoHttpLoader {
  return new TranslatePoHttpLoader(http, 'assets/i18n', '.po');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    WinnerComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    RaffleComponent,
    LoginModalComponent,
    GamblingComponent,
    ContactsComponent,
    HowToComponent,
    PageNotFoundComponent,
    OddsCalculatorComponent,
    RafflesComponent,
    PolicyComponent,
    TermsOfUseComponent,
    ServicesComponent,
    SignUpModalComponent,
    NewPasswordModalComponent,
    ForgotPasswordModalComponent,
    ChangePasswordModalComponent,
    ThankYouModalComponent,
    YouGotMailModalComponent,
    PaymentModalComponent,
    CongratulationsComponent,
    LoaderComponent,
    MyRafflesComponent,
    MyPurchaseComponent,
    MyAccountComponent,
    MyRafflesSwiperComponent,
    AccountSettingComponent,
    PersonalInfoComponent,
    CongratulationsModalComponent,
    UserNotVerifiedModalComponent,
    RaffleCountDownComponent,
    WinnerModal,
    CountdownComponent,
    OtpModalComponent,
    OtpAwesomeModalComponent,
    PaymentFailedModalComponent
  ],
  imports: [
    ReactiveFormsModule,
    SocialLoginModule,
    HttpClientModule,
    CommonModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    SwiperModule,
    SharedModule,
    NgxDatatableModule,
    AppleSigninModule,
    TextMaskModule,
    NgImageSliderModule,
    SpeedTestModule,
    PixelModule.forRoot({ enabled: true, pixelId: '717393679420327' }),
    ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-bottom-right'
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig],
      multi: true,
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          // {
          //   id: GoogleLoginProvider.PROVIDER_ID,
          //   provider: new GoogleLoginProvider(
          //     '702125030129-ov8fqdf1murl94qe1nv6m6iu9svnc1bs.apps.googleusercontent.com'
          //   )
          // },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(
            '900207470694198'
              //  '717393679420327'
              // '730087327970494'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
