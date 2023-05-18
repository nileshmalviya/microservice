//import { FlipDown } from '../';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { FlipDown } from '../flipdown/flipdown';

@Component({
  selector: 'app-countdown',
  templateUrl: './count-down.component.html'
})

export class CountdownComponent implements AfterViewInit {

  @ViewChild('flipdownRef') flipdownRef: ElementRef;
  @Input() hideDays?: boolean;
  @Input() id: string;
  @Input() endDate: Moment;
  @Output() finished: any = new EventEmitter<any>();

  public flipDown: any;
  private argument = (new Date().getTime() / 1000) + (3600 * (24 * 25)) + 1;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.initCountDown();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.endDate.firstChange){
      this.initCountDown();
    }
  }

  private initCountDown(): void {

   // var mon  = Number(this.endDate.month) + 1;
   this.endDate = moment(this.endDate);
    //this.endDate = moment(this.endDate.year+"-"+ this.endDate.month +"-"+this.endDate.day+" "+this.endDate.hour+":"+this.endDate.minute+":"+this.endDate.second, true);
   const endDate = this.endDate && this.endDate.isValid()?(this.endDate.valueOf() / 1000) : this.argument;
   this.flipDown = new FlipDown(endDate, this.id, {theme: 'light',hideDays: !!this.hideDays})
        .start().ifEnded(() => {
          this.finished.emit({val: 'Done'});
        });
    this.addValueClasses();

  }

  /**
   * This method adds a class (days | hours| minutes | second) to every rotor group depending on data-before element's attribute.
   */
  private addValueClasses(): void {
    this.flipdownRef.nativeElement.childNodes.forEach(node => {
      const elem = [...node.childNodes].find(el => el.hasAttribute('data-before'));
      const className = elem.getAttribute('data-before').toLowerCase();
      node.classList.add(className);
    });
  }



}

