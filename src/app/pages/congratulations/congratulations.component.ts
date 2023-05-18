import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MainService} from '../../services/main.service';
import {ConnectedUserModel} from '../../interfaces/user-model';
import {AccountService} from '../../services/account.service';
import {RafflesModalService} from '../../services/raffles-modal.service';
import {NgForm} from '@angular/forms';
import {WinningTicketDataModel, WinningTicketDetailsModel} from '../../interfaces/raffle';
import TwoRaffleHelpers from '../../helpers/helpers';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-congratulations',
  templateUrl: './congratulations.component.html',
  styles: [],
})
export class CongratulationsComponent implements OnInit {

  private ticketId: string;
  private raffleId: string;
  private connectedUser: ConnectedUserModel;

  public isLoading = true;
  public ticketData: WinningTicketDataModel;
  public details: WinningTicketDetailsModel;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private accountService: AccountService,
              private modalService: RafflesModalService,
              private rafflesService: MainService) {
  }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.params.ticketId;
    this.raffleId = this.route.snapshot.queryParams.rid;

    if (!this.ticketId) {
      this.onError();
    } else {
      this.connectedUser = this.accountService.getConnectedUserSync();

      if (!this.connectedUser) {
        this.modalService.openLoginModal();
        this.isLoading = false;

        this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
          this.connectedUser = connectedUser;
          if (this.connectedUser) {
            this.loadTicket();
          }
        });
      } else {
        this.loadTicket();
      }
    }
  }

  private loadTicket(): void {
    this.isLoading = true;
    this.rafflesService.getWinningTicket(this.raffleId, this.ticketId)
        .subscribe((response) => {
          if (!response.result) {
            this.onError();
          } else {
            this.ticketData = response.data;

            this.details = new WinningTicketDetailsModel();
            this.details.raffleId = this.raffleId;
            this.details.ticketId = this.ticketId;

            this.isLoading = false;
          }
        }, (err) => {
          this.onError();
        });
  }

  public submit(f: NgForm): void {
    if (f.invalid) {
      TwoRaffleHelpers.markFormInvalidAndFocus(f);
    } else {
      this.isLoading = true;
      f.form.disable();
      this.rafflesService.updateWinningTicketDetails(this.details)
          .pipe(finalize(() => {
            this.isLoading = false;
            f.form.enable();
          }))
          .subscribe((response) => {
            if (!response.result) {
              // TODO: error
            } else {
              this.ticketData.hasFilledInformation = true;
            }
          }, (err) => {
            // TODO: error
          });
    }
  }

  private onError(): void {
    this.router.navigate(['/home']);
  }
}
