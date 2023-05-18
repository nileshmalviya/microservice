import { AccountService } from 'src/app/services/account.service';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-winner-modal',
    templateUrl: './winner-modal.component.html',
    styles: [],
  })

  export class WinnerModal implements OnInit {
    htmlContent:any;
    @Input() public winnerTiketId:any;

    constructor(public activeModal: NgbActiveModal, private sanitized: DomSanitizer) {
      var htmlvar="";
	    for(var im=1;im<211;im++){
		    var ln = ((im-1)+"").length;
		    var imagename="";
		    switch(ln) {
			    case 1:
				    imagename = "0000"+(im-1);
				    break;
			    case 2 :
				    imagename = "000"+(im-1);
				    break;	
				    case 3 :
				    imagename = "00"+(im-1);
				    break;	
		    }
		    htmlvar+="<img id='img"+im+"' style='display:none' 'class='imgclass' src ='assets/images/Winning_PopUp/Winning_PopUp_Alpha_v3_"+imagename+".png' alt='no img'/>"
      }
      this.htmlContent="";
      this.htmlContent = this.sanitized.bypassSecurityTrustHtml(htmlvar);
    }

    ngOnInit(): void {
      document.getElementById("winnerDiv").style.display = "none";
      var time = 2;
	    var interval = setInterval(function() { 
        if (time < 211) { 
          console.log(time);
          document.getElementById('img'+(time-1)).style.display="none";
          document.getElementById('img'+(time)).style.display="block";
          time++;
        }
        else { 
          document.getElementById("winnerDiv").style.display = "block";
          clearInterval(interval);
          }
      }, 55);
    }

    ngOnDestroy(){
      this.htmlContent = "";
    }
  }
