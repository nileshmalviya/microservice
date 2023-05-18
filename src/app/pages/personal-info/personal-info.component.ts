import { Component, OnInit } from '@angular/core';
import { ConnectedUserModel, CountryDataModel, UserInfoDataModel } from 'src/app/interfaces/user-model';
import { AccountService } from "src/app/services/account.service";
import { MainService } from 'src/app/services/main.service';
import { RafflesModalService } from 'src/app/services/raffles-modal.service';
import { ServerResponse } from 'src/app/interfaces/server-response';
import { NgForm } from '@angular/forms';
import TwoRaffleHelpers from 'src/app/helpers/helpers';
import { finalize } from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  public countryValidation:boolean;
  public connectedUser: ConnectedUserModel = null;
  public userInfoDataModel: UserInfoDataModel = new UserInfoDataModel();
  countryObject: any = [
    {
        name: this.accountService.getKeyValue('Select_Country'),
        id: 0
    },
];

  constructor(private mainService: MainService,
    private router: Router,
    private accountService: AccountService,
    private modalService: RafflesModalService, private toastr: ToastrService, ) { }

    ngOnInit(): void {
      console.log("Account Setting page");
      this.connectedUser = this.accountService.getConnectedUserSync();
         if(this.connectedUser != null || this.connectedUser != undefined)
              { this.getAllCountry();
               this.getUserInfoData();}
         else{
          localStorage.setItem("fromAutoGenratedPassLink","true");
          this.router.navigate(["/home"],{ queryParams: {signIn:true}});
         }
        }

    ngOnDestroy(){
      if(this.connectedUser != null || this.connectedUser != undefined){
        this.accountService.IsUserBlock(this.connectedUser.id).subscribe(response => {
          if(response.result){
            this.accountService.userBlockEvent.emit(response.data);
          }
        }, (error)=>{
          console.log("error:: ",error);
          this.accountService.checkErrorResponse(error);
        })
      }
    } 

    getAllCountry() {
      this.countryValidation=false;
      this.mainService.getAllCountryData().subscribe((res: ServerResponse<any>)=>{
        if(res.result){
          res.data.forEach(element => {
            this.countryObject.push(element);
          });
          console.log("country obj ",this.countryObject);
        }
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
    });
    }

    getUserInfoData() {
      this.mainService.getPersonalUserInfoData(this.connectedUser.id).subscribe((res: ServerResponse<UserInfoDataModel>)=>{
        if(res.result){
          if(res.data !== null){
            this.userInfoDataModel.id= res.data.id;
            this.userInfoDataModel.address = res.data.address;
            //this.userInfoDataModel.country = res.data.country;
            this.userInfoDataModel.countryId = !res.data.countryId ? this.countryObject[0].id : res.data.countryId;
            this.userInfoDataModel.city = res.data.city;
            this.userInfoDataModel.state = res.data.state;
            this.userInfoDataModel.apartment = res.data.apartment;
            this.userInfoDataModel.zipCode = res.data.zipCode;
            console.log("===============---->",this.userInfoDataModel);
          }else{
            this.userInfoDataModel.countryId = this.countryObject[0].id;
          }
        }
      }, (error)=>{
        console.log("error:: ",error);
      //  this.accountService.checkErrorResponse(error);
    });
    }

   public countryValidation1()
   {
     this.countryValidation=false;
   }

    public Submit(f: NgForm): void {
      if (f.invalid) {
        if(this.userInfoDataModel.countryId==0){
          this.countryValidation=true;
        }
        TwoRaffleHelpers.markFormInvalidAndFocus(f);
        return;
      }
      f.form.disable();
      console.log("f: ",f);
      console.log("userInfoDataModel: ",this.userInfoDataModel);
      this.userInfoDataModel.userId = this.connectedUser.id;
      //this.userInfoDataModel.countryId =
      this.mainService.UpdateLoggedInUserPersonalData(this.userInfoDataModel)
              .pipe(
                  finalize(() => {
                      f.form.enable();
                  })
              )
              .subscribe((response: ServerResponse<UserInfoDataModel>) => {
                  console.log(response);
                  if (response.result) {
                   // f.resetForm();
                    this.toastr.success(this.accountService.getKeyValue('toastr_action_was_compelted'));
                  } else {
                    this.toastr.error(this.accountService.getKeyValue('toastr_action_was_not_completed'));
                  }
              }, (error)=>{
                console.log("error:: ",error);
                this.accountService.checkErrorResponse(error);
            });
    }
}
