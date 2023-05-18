import {Component, OnInit} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {NgForm} from '@angular/forms';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';
import {ServerResponse} from '../../interfaces/server-response';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {RafflesModalService} from '../../services/raffles-modal.service';
import { MarketingCampaignModel } from 'src/app/interfaces/data-models';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { MainService } from 'src/app/services/main.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-otp-awesome-modal',
    templateUrl: './otp-awesome-modal.component.html',
})

export class OtpAwesomeModalComponent implements OnInit
{
    constructor(private accountService: AccountService, private router: Router, public activeModal: NgbActiveModal,
        public modalService: RafflesModalService,
        private socialAuthService: SocialAuthService,private mainServic: MainService,private jwtHelper :JwtHelperService,private route:ActivatedRoute,
        private toastr: ToastrService)
        {

        }

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
    openToPurchase(){
        this.activeModal.close();
    }
}
