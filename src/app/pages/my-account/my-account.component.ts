import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserProfileImageUpload } from 'src/app/interfaces/user-model';
import { AccountService } from 'src/app/services/account.service';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  globalTabId: string = "";
  connectedUser: any;
  firstName: string = "";
  lastName: string = "";
  imageUrl:string = "assets/images/dummy-img.png";
   //upload profile image
   userProfileImageUpload:UserProfileImageUpload = new UserProfileImageUpload();

  constructor(public router: Router,
    private route: ActivatedRoute,private toastr: ToastrService,
    private accountService: AccountService,) {
    this.route.params.subscribe((params) => this.globalTabId = params['tabID'] ? params['tabID'] : 'my-raffles');

  }

  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      this.connectedUser = this.accountService.getConnectedUserSync();
    if(this.connectedUser != null || this.connectedUser != undefined)
    {
      this.firstName = this.connectedUser.firstName;
      this.lastName = this.connectedUser.lastName;
      this.accountService.getProfileImage(this.connectedUser.id).subscribe((response)=>{
        if(response.result){
          console.log("res dtdttd ",response.data);
          var url = response.data.profileImageUrl;
         this.imageUrl = url == null || url == undefined ? "assets/images/dummy-img.png" :  this.accountService.getServerUrl(response.data.profileImageUrl);

          }
        }, (error)=>{
          console.log("error:: ",error);
          this.accountService.checkErrorResponse(error);
      })
      }
    })
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

 onSelectFile(event) {
  if (event.target.files && event.target.files[0]) {
    this.userProfileImageUpload.userId = this.connectedUser.id;
    this.userProfileImageUpload.UserProfileImgFile  = event.target.files[0];
      this.accountService.saveProfileImage(this.userProfileImageUpload).subscribe((response)=>{
        if (response.result) {
          const userImage =  this.imageUrl = this.accountService.getServerUrl(response.data);
          this.accountService.profileChange(userImage);
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

  updateDetails($event:any){
    this.connectedUser = this.accountService.getConnectedUserSync();
    if(this.connectedUser != null || this.connectedUser != undefined)
    {
      this.firstName = this.connectedUser.firstName;
      this.lastName = this.connectedUser.lastName;
      this.accountService.getProfileImage(this.connectedUser.id).subscribe((response)=>{
        if(response.result){
          console.log("res dtdttd ",response.data);
          var url = response.data.profileImageUrl;
         this.imageUrl = url == null || url == undefined ? "assets/images/dummy-img.png" :  this.accountService.getServerUrl(response.data.profileImageUrl);
        }
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
    })
    }
    console.log($event);
  }
}
