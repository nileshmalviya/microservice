/* tslint:disable:no-bitwise */
import { FormGroup, NgForm } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeModel } from '../interfaces/shared-models';

export default class TwoRaffleHelpers {

  public static markFormInvalidAndFocus(f: NgForm): void {
    // Jump to fist invalid element and mark all controls as touched
    let elementToFocus: any;
    for (const currControlName of Object.keys(f.controls)) {

      const currControl = f.controls[currControlName];
      currControl.markAsTouched();

      if (!elementToFocus && currControl.invalid) {
        elementToFocus = document.getElementsByName(currControlName)[0];

        if (!elementToFocus) {
          elementToFocus = document.getElementById(currControlName);
        }
      }

      if (currControl instanceof FormGroup) {
        TwoRaffleHelpers.markFormGroupInvalidAndFocus(currControl as FormGroup);
      }
    }

    if (elementToFocus) {
      elementToFocus.scrollIntoView();
      elementToFocus.focus();
    }
  }

  public static markFormGroupInvalidAndFocus(g: FormGroup): void {
    // Jump to fist invalid element and mark all controls as touched
    let elementToFocus: any;
    for (const currControlName of Object.keys(g.controls)) {

      const currControl = g.controls[currControlName];
      currControl.markAsTouched();

      if (!elementToFocus && currControl.invalid) {
        elementToFocus = document.getElementsByName(currControlName)[0];

        if (!elementToFocus) {
          elementToFocus = document.getElementById(currControlName);
        }
      }
    }

    if (elementToFocus) {
      elementToFocus.scrollIntoView();
      elementToFocus.focus();
    }
  }

  public static compareNumber(a: number, b: number, isDescending: boolean): number {
    if (a < b) {
      return isDescending ? 1 : -1;
    }

    if (a > b) {
      return isDescending ? -1 : 1;
    }

    // must be equal
    return 0;
  }

  public static compareStrings(a: string, b: string, isDescending: boolean): number {
    let strA = '';
    if (a) {
      strA = a.toUpperCase(); // ignore upper and lowercase
    }

    let strB = '';
    if (b) {
      strB = b.toUpperCase(); // ignore upper and lowercase
    }

    if (strA < strB) {
      return isDescending ? 1 : -1;
    }

    if (strA > strB) {
      return isDescending ? -1 : 1;
    }

    // names must be equal
    return 0;
  }

  public static getMomentFromDateTimeModel(dateTimeModel: DateTimeModel): Moment {
    if (!dateTimeModel) {
      return null;
    }

    return moment({
      date: dateTimeModel.day,
      month: dateTimeModel.month - 1,
      year: dateTimeModel.year,
      hour: dateTimeModel.hour,
      minute: dateTimeModel.minute,
      second: dateTimeModel.second
    });
  }

  public static getMomentFromNgbDateStruct(dateStruct: NgbDateStruct): Moment {
    if (!dateStruct) {
      return null;
    }

    return moment({
      date: dateStruct.day,
      month: dateStruct.month - 1,
      year: dateStruct.year
    });
  }

  public static getMomentDateTime(dateTime: string): Moment {
    return moment(dateTime, 'YYYY-MM-DDTHH:mm:ss');
  }

  public static getServerDateTimeStringFromMoment(momentObj: Moment): string {
    return momentObj.format('DD-MM-YYYY HH:mm');
  }

  public static getServerDateTimeStringFromNgbDateStruct(dateStruct: NgbDateStruct): string {
    if (!dateStruct) {
      return null;
    }

    return TwoRaffleHelpers.getServerDateTimeStringFromMoment(TwoRaffleHelpers.getMomentFromNgbDateStruct(dateStruct));
  }

  public static getNgbDateStructFromDateTime(dateTime: string): NgbDateStruct {
    if (!dateTime) {
      return null;
    }

    const tmpMoment = TwoRaffleHelpers.getMomentDateTime(dateTime);

    return {
      day: tmpMoment.date(),
      month: tmpMoment.month() + 1,
      year: tmpMoment.year()
    };
  }

  public static getMomentDate(date: string): Moment {
    return moment(date, 'YYYY-MM-DD');
  }

  public static getServerDateStringFromMoment(momentObj: Moment): string {
    return momentObj.format('DD-MM-YYYY');
  }

  public static getNgbDateStructFromDate(date: string): NgbDateStruct {
    if (!date) {
      return null;
    }

    const tmpMoment = TwoRaffleHelpers.getMomentDate(date);

    return {
      day: tmpMoment.date(),
      month: tmpMoment.month() + 1,
      year: tmpMoment.year()
    };
  }

  public static getMomentTime(time: string): Moment {
    return moment(time, 'HH:mm:ss');
  }

  public static getNgbTimeStructFromDateTime(dateTime: string): NgbTimeStruct {
    if (!dateTime) {
      return null;
    }

    const tmpMoment = TwoRaffleHelpers.getMomentDateTime(dateTime);

    return {
      hour: tmpMoment.hour(),
      minute: tmpMoment.minute(),
      second: tmpMoment.second()
    };
  }

  public static getNgbTimeStructFromTime(time: string): NgbTimeStruct {
    if (!time) {
      return null;
    }

    const tmpMoment = TwoRaffleHelpers.getMomentTime(time);

    return {
      hour: tmpMoment.hour(),
      minute: tmpMoment.minute(),
      second: tmpMoment.second()
    };
  }

  public static getMomentFromNgbTimeStruct(timeStruct: NgbTimeStruct): Moment {
    if (!timeStruct) {
      return null;
    }

    return moment({
      hour: timeStruct.hour,
      minute: timeStruct.minute,
      second: timeStruct.second
    });
  }

  public static getServerTimeStringFromMoment(momentObj: Moment): string {
    if (!momentObj) {
      return null;
    }

    return momentObj.format('HH:mm:ss');
  }

  public static getServerTimeStringFromNgbTimeStruct(timeStruct: NgbTimeStruct): string {
    if (!timeStruct) {
      return null;
    }

    return TwoRaffleHelpers.getServerTimeStringFromMoment(TwoRaffleHelpers.getMomentFromNgbTimeStruct(timeStruct));
  }

  public static getTimeStringFromSeconds(seconds: number): string {
    if (!seconds) {
      return '00:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return ((mins < 10) ? '0' : '') + mins + ':' + ((secs < 10) ? '0' : '') + secs;
  }

  public static getDateTimeModelFromMoment(momentObj: Moment): DateTimeModel {
    return {
      year: momentObj.year(),
      month: momentObj.month() + 1,
      day: momentObj.date(),
      hour: momentObj.hour(),
      minute: momentObj.minute(),
      second: momentObj.second()
    };
  }
  public static convertUTCtoLocal(dateTime: Date): DateTimeModel {
    var localDate = new Date(dateTime);
        //ele.raffleDate.day = localDate.getDate();
    return {
      year: localDate.getFullYear(),
      month: localDate.getMonth() ,
      day: localDate.getDate(),
      hour: localDate.getHours(),
      minute: localDate.getMinutes(),
      second: localDate.getSeconds()
    };
}

public static getUTCTimeDifference():String {
  var timezone_offset_min = new Date().getTimezoneOffset();
 var offset_hrs = parseInt(""+Math.abs(timezone_offset_min/60));
 var offset_min = Math.abs(timezone_offset_min%60),
 timezone_standard;
 var offset_hrs_str = ""+offset_hrs;
 var offset_min_str = ""+offset_min;
 if(offset_hrs < 10)
     offset_hrs_str = "0" + offset_hrs_str;

 if(offset_min < 10)
     offset_min_str = '0' + offset_min_str;

// Add an opposite sign to the offset
// If offset is 0, it means timezone is UTC
if(timezone_offset_min < 0)
 timezone_standard = 'p' + offset_hrs_str + ':' + offset_min_str;
else if(timezone_offset_min > 0)
 timezone_standard = 'n' + offset_hrs_str + ':' + offset_min_str;
else if(timezone_offset_min == 0)
timezone_standard = 'Z';
// Timezone difference in hours and minutes
// String such as p5:30 or n6:00 or Z
// console.log(timezone_standard); 
 return timezone_standard;
}
}
