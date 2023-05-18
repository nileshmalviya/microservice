import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-odds-calculator',
  templateUrl: './odds-calculator.component.html',
})
export class OddsCalculatorComponent implements OnInit {
  collapsed = false;
  openInMobile = true;
  showResultOnMobile = false;

  toggleInMobile() {
    this.openInMobile = false;
  }

  rotateArrow() {
    let deg: number = Math.floor(Math.random() * (360 - 250 + 1)) + 250;
    let deg2: number = Math.floor(Math.random() * (110 - 0 + 1)) + 0;
    let deg3: number = deg2 || deg;
    let niddle: any = document.querySelector('.niddle');
    niddle.style.transform = `rotate(${deg3}deg)`;
    console.log(deg3);
  }

  constructor() {}

  ngOnInit(): void {}
}
