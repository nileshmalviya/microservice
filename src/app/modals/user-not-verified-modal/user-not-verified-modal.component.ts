import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-not-verified-modal',
  templateUrl: './user-not-verified-modal.component.html',
  styleUrls: ['./user-not-verified-modal.component.scss']
})
export class UserNotVerifiedModalComponent implements OnInit {
  loading = false;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
  }

}
