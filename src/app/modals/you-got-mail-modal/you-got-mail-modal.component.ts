import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-you-got-mail-modal',
  templateUrl: './you-got-mail-modal.component.html',
  styles: [],
})
export class YouGotMailModalComponent implements OnInit {
  loading = false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
