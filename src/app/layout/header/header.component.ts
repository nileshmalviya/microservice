import { MainService } from './../../services/main.service';
import { response } from 'express';
import { Component, Input, OnInit, Output, EventEmitter,HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { ConnectedUserModel } from '../../interfaces/user-model';
import {RafflesModalService} from '../../services/raffles-modal.service';
import { TranslationService } from '../../services/translation.service';
import { FooterComponent } from '../footer/footer.component';
import { ToastrService } from 'ngx-toastr';
import { fn } from '@angular/compiler/src/output/output_ast';
import { PixelService } from 'ngx-pixel';
import { eventNames } from 'process';
import { AppConfig } from 'src/app/services/app.config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  @Input() isMenuCollapsed: boolean;
  @Output() collapse = new EventEmitter();
  
  public selectedLanguage = "es-ES";
  public currentUser: ConnectedUserModel;
  public loginUser:any;
  public imageUrl:any;
  public displayOrNOt:string;
  public displayOrNOt1:string;
  public languageChange:any="ES";
  public isblockornot:any="none"
  public evenodd:boolean=false;
  public selectedLanguageGlobal:any;
  // public evenodd1:boolean=false;
  @Input() fordropdownValue:string;

  constructor(
    private router: Router,
    private translate: TranslationService,
    public accountService: AccountService,
    private modalService: RafflesModalService,
    private route: ActivatedRoute, 
    private toastr: ToastrService,
    private mainService:MainService,
    private pixel: PixelService
  ) {
    // this.loginUser = localStorage.getItem('currentUSer');
    // console.log("Local user123",this.loginUser);
  }

  ngOnInit(): void {
    this.accountService.getProfileImageOfUser();
    this.selectedLanguageGlobal= AppConfig.settings.selectedlanguage;
  
this.collapseMenu1(location.pathname.split('/')[1]);
   this.initUser();

    var selectedLanguage = localStorage.getItem("selectedLanguage");
    this.languageChange=selectedLanguage!=null && selectedLanguage.includes("en") ? "ENG" : "ES";
  
    this.route.queryParams.subscribe(params => {
      if (params.signUp && !this.currentUser){
       this.openRegister()
      }
    });
    if(selectedLanguage){
      var id=document.getElementById('navbar-nav');
      if(selectedLanguage == 'es-ES'){
        id.classList.add("es-navbar-nav");
      }else{
        id.classList.remove("es-navbar-nav");
      }
      this.selectedLanguage = selectedLanguage;
    }
    this.ckeckUserBlockForState();
  }

  ngOnChanges(){
    this.accountService.profileChangeEvent.subscribe(response =>{
      this.imageUrl = response;
    })
    this.accountService.userBlockEvent.subscribe(response => {
      if(response){
        this.toastr.error(this.accountService.getKeyValue('toastr_admin_block_this_user'));
        this.logOut()
      }
    })
  }

  public collapseMenu(): void {
    this.isMenuCollapsed = true;
    this.emitMenuState();
  }

  public collapseMenu1(event): void {
    if(event.includes("account-setting") || 
       event.includes("my-raffles")      || 
       event.includes("my-purchases")    || 
       event.includes("personal-info")   ){
        this.mainService.isUserVerified(this.accountService.connectedUser.id).subscribe((res) =>{
          if(res.result){
            if(res.data){
              this.router.navigate(["/my-account/"+event]);
              this.isMenuCollapsed = true;
              this.emitMenuState();
              this.pixel.trackCustom(event, {
                status:true
              });
            }
          }else{
            this.modalService.openOtpVarifyModal();
          }
        });
    }else{
      this.isMenuCollapsed = true;
      this.emitMenuState();
      this.pixel.trackCustom(event, {
        status:true
      });
    }
   
  }

  public toggleMenu(): void {
    this.displayOrNOt1="none" ;  
    this.evenodd=false
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this.emitMenuState();
  }

  public changeLanguage(selectedLanguage: any) {
  //   var id=document.getElementById('navbar-nav');
    
  //   if(this.currentUser != undefined || this.currentUser != null){
  //     this.accountService.updateSelectedLanguage(this.currentUser.id, selectedLanguage).subscribe((response)=>{
  //     if(response.result && response.data){
       
  //     }
  //  });
  // }
  //   if(selectedLanguage == 'es-ES'){
  //     id.classList.add("es-navbar-nav");
  //   }else{
  //     id.classList.remove("es-navbar-nav");
  //   }
  //   this.translate.use(selectedLanguage);
  //  localStorage.setItem("selectedLanguage",selectedLanguage);

  //   this.mainService.messageSource.next('0');
  }

  public emitMenuState(): void {
    this.ckeckUserBlockForState();
    this.collapse.emit(this.isMenuCollapsed);
  }

  public login(): void {
    this.collapseMenu();
    this.modalService.openLoginModal();
    this.pixel.trackCustom('LoginView', {
      content_name:'LoginView',
      status:true
    });
  }

    public register(): void {
        this.collapseMenu();
        this.modalService.openRegisterModal();
        this.pixel.trackCustom('RegisterView', {
          content_name:'RegisterView',
          status:true
        });
    }

  private initUser(): void {
    this.currentUser = this.accountService.getConnectedUserSync();
    this.accountService.connectedUserChanged.subscribe((connectedUser: ConnectedUserModel) => {
      this.currentUser = connectedUser;
    });
  }

  logoReloadCurrentPage() {
    window.location.reload();
   }

  logOut(): void {
    this.accountService.logout().subscribe((res) => {
      console.log("calling footer",FooterComponent)
      this.router.navigate(["/home"]);
    });
  }

  openRegister(){
    this.collapseMenu();
    this.modalService.openRegisterModal()
  }

  getProfileImage(){
    
    this.accountService.getProfileImage(this.currentUser.id).subscribe(response =>{
      if(response.result){
        // this.dataWinner.emit(true);
        var url = response.data.profileImageUrl;
       this.imageUrl = url == null || url == undefined ? "https://i.stack.imgur.com/34AD2.jpg" :  this.accountService.getServerUrl(response.data.profileImageUrl);
       console.log("--this.imageUrl--", this.imageUrl);

      }
    }, (error)=>{
      console.log("error:: ",error);
      this.accountService.checkErrorResponse(error);
  })
  }

  private ckeckUserBlockForState(){
    if(this.currentUser != null || this.currentUser != undefined){
      this.accountService.IsUserBlock(this.currentUser.id).subscribe(response => {
        if(response.result){
          this.accountService.userBlockEvent.emit(response.data);
        }
      }, (error)=>{
        console.log("error:: ",error);
        this.accountService.checkErrorResponse(error);
    })
  }
  }

public changeLanguage1()
  {
    if(this.evenodd){
      this.evenodd=false;
      this.displayOrNOt="none" ;  
    }
    else{
      this.evenodd=true;
      this.displayOrNOt="block";
    }
  }

  public changeLanguage2(){
    if(this.evenodd){
      this.evenodd=false;
      this.displayOrNOt1="none" ;  
    }
    else{
      this.evenodd=true;
      this.displayOrNOt1="block";
    }
  }

  public changelanguage(selectedLanguage:any){
    this.evenodd=false
    if(selectedLanguage=='en-US'){
      this.displayOrNOt="none";
      this.displayOrNOt1="none";
      this.languageChange="ENG";
    }
    else{
      this.displayOrNOt="none"
      this.displayOrNOt1="none"
      this.languageChange="ES"
    }
    // this code is releted to change language 
      var id=document.getElementById('navbar-nav');
     if(this.currentUser != undefined || this.currentUser != null){
      this.accountService.updateSelectedLanguage(this.currentUser.id, selectedLanguage).subscribe((response)=>{
      if(response.result && response.data){
      }
   });
  }
    if(selectedLanguage == 'es-ES'){
      id.classList.add("es-navbar-nav");
    }else{
      id.classList.remove("es-navbar-nav");
    }
    this.translate.use(selectedLanguage);
    localStorage.setItem("selectedLanguage",selectedLanguage);
    this.mainService.messageSource.next('0');
    //end
        
  }

}
