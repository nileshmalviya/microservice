import {Component, Injectable} from '@angular/core';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {YouGotMailModalComponent} from '../modals/you-got-mail-modal/you-got-mail-modal.component';
import {NewPasswordModalComponent} from '../modals/new-password-modal/new-password-modal.component';
import {RaffleFullModel} from '../interfaces/raffle';
import {ThankYouModalComponent} from '../modals/thank-you-modal/thank-you-modal.component';
import {PaymentModalComponent} from '../modals/payment-modal/payment-modal.component';
import {LoginModalComponent} from '../modals/login-modal/login-modal.component';
import {SignUpModalComponent} from '../modals/sign-up-modal/sign-up-modal.component';
import {ForgotPasswordModalComponent} from '../modals/forgot-password-modal/forgot-password-modal.component';
import {ChangePasswordModalComponent} from '../modals/change-password-modal/change-password-modal.component';
import {RafflePackageModel} from '../interfaces/data-models';
import { UserDataModel } from '../interfaces/user-model';
import { CongratulationsModalComponent } from '../modals/congratulations-modal/congratulations-modal.component';
import { UserNotVerifiedModalComponent } from '../modals/user-not-verified-modal/user-not-verified-modal.component';
import { PaymentFailedModalComponent } from '../modals/payment-failed-modal/payment-failed-modal.component';
import { RaffleCountDownComponent } from '../modals/raffle-count-down/raffle-count-down.component';
import { WinnerModal } from '../modals/winner-modal/winner-modal.component';
import { OtpModalComponent } from '../modals/otp-varify-modal/otp-varify-modal.component';
import { OtpAwesomeModalComponent } from '../modals/otp-awesome-modal/otp-awesome-modal.component';

@Injectable({
    providedIn: 'root'
})
export class RafflesModalService {

    public raffleCurrentPayment:any;
    public raffleModalData:any;
    constructor(private modalService: NgbModal) {
    }

    openLoginModal(): NgbModalRef {
        return this.openModal(LoginModalComponent, 'login-modal',false);
    }

    openRegisterModal(): NgbModalRef {
        return this.openModal(SignUpModalComponent, 'register-modal',false);
    }

    openForgotPasswordModal(): NgbModalRef {
        return this.openModal(ForgotPasswordModalComponent, 'forgot-password-modal',false);
    }

    openChangePasswordModal(userData: UserDataModel): NgbModalRef {
        const modal = this.openModal(ChangePasswordModalComponent, 'change-password-modal',false);
        (modal.componentInstance as ChangePasswordModalComponent).userDataModel = userData;
        return modal;
    }

    openForgotPasswordEmailSentModal(): NgbModalRef {
        return this.openModal(YouGotMailModalComponent, 'forgot-password-email-sent-modal',false);
    }

    openResetPasswordModal(email:string,resetCode:string): NgbModalRef {
        const modal = this.openModal(NewPasswordModalComponent, 'reset-password-modal',false);
        (modal.componentInstance as NewPasswordModalComponent).email = email;
        (modal.componentInstance as NewPasswordModalComponent).code = resetCode;
        return modal;
    }

    openCongratulationsModal(winner): NgbModalRef {
         const modal = this.openModal(CongratulationsModalComponent, 'congratulations-modal',false);
         console.log(";;=....====>",winner);

         (modal.componentInstance as CongratulationsModalComponent).winner = winner;
         return modal;
    }

    openPaymentFailedModal(raffle: RaffleFullModel, rafflePackage: RafflePackageModel):NgbModalRef  {
        // const modal = this.openModal(PaymentFailedModalComponent, 'paymentFailed-modal');
        const modal =  this.openModal(PaymentFailedModalComponent, 'payment-modal', false);
        (modal.componentInstance as PaymentFailedModalComponent).raffle = raffle;
        (modal.componentInstance as PaymentFailedModalComponent).selectedPackage = rafflePackage;
        return modal;
    }

   openRaffleCountDown(date:any): NgbModalRef{
     const modal = this.openModal(RaffleCountDownComponent, 'raffle-count-down');
     (modal.componentInstance as RaffleCountDownComponent).raffles = date;
    return modal;
   }

    openWinnerModal(data:any): NgbModalRef {
      const modal = this.openModal(WinnerModal, 'winner-modal');
      (modal.componentInstance as WinnerModal).winnerTiketId = data;
      return modal;
    }

    openPaymentModal(raffle: RaffleFullModel, rafflePackage: RafflePackageModel): NgbModalRef {
      console.log({
        raffle: raffle,
        rafflePackage: rafflePackage
      });

        // openPaymentModal(): NgbModalRef {
        const modal =  this.openModal(PaymentModalComponent, 'payment-modal', false);
        (modal.componentInstance as PaymentModalComponent).raffle = raffle;
        (modal.componentInstance as PaymentModalComponent).selectedPackage = rafflePackage;
        return modal;
    }

    openPaymentSuccessModal(): NgbModalRef {
        return this.openModal(ThankYouModalComponent, 'payment-success-modal',false);
    }

    openUserNotVerifiedModal(): NgbModalRef {
        return this.openModal(UserNotVerifiedModalComponent, 'User-not-verified-modal');
    }
    openOtpVarifyModal(): NgbModalRef {
        return this.openModal(OtpModalComponent, 'otp-varify-modal');
    }
    openOtpAwesomeModal():NgbModalRef{
        return this.openModal(OtpAwesomeModalComponent, 'otp-awesome-modal');
    }
    openModal(modalType: any, ariaLabelledBy: string = '', modatStatic:boolean = true): NgbModalRef {
        this.modalService.dismissAll();

        const modal = this.modalService
            .open(modalType, {
                ariaLabelledBy,
                windowClass: 'base-modal',
                centered: true,
                backdrop: modatStatic === false ? 'static' : true,
                keyboard: modatStatic === false ? false : true,
            });

        return modal;
    }


    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
}
