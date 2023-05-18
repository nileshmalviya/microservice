import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you-modal.component.html',
  styles: [],
})
export class ThankYouModalComponent implements OnInit {
  loading = false;
  constructor(private route: ActivatedRoute,
    private router: Router,
    public activeModal: NgbActiveModal,public accountService : AccountService) {}

  ngOnInit(): void {
  }
   public activeModalClose() {
    this.activeModal.dismiss('Cross click');
    this.router.navigate(['/home']);
  }
  
}
