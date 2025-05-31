import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CookieService } from 'ngx-cookie-service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BannersComponent } from './banners/banners.component';
import { BrandsComponent } from './brands/brands.component';
import { PromotiongifComponent } from './promotiongif/promotiongif.component';
import { OverviewComponent } from './overview/overview.component';
import { HelpcenterComponent } from './helpcenter/helpcenter.component';
import { ItemsComponent } from './items/items.component';
import { NotificationComponent } from './notification/notification.component';
import { LoginComponent } from './login/login.component';
import { AddSubItemsComponent } from './add-sub-items/add-sub-items.component';
import { EditsubitemsComponent } from './editsubitems/editsubitems.component';
import { AuthInterceptor } from './auth.interceptor';
import { RouterModule } from '@angular/router';
import { UserInfoComponent } from './user-info/user-info.component';
import { PincodesComponent } from './pincodes/pincodes.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    DashboardComponent,
    BannersComponent,
    BrandsComponent,
    PromotiongifComponent,
    OverviewComponent,
    HelpcenterComponent,
    ItemsComponent,
    NotificationComponent,
    LoginComponent,
    AddSubItemsComponent,
    EditsubitemsComponent,
    UserInfoComponent,
    PincodesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule, // For LoginComponent
    HttpClientModule,RouterModule,
    
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}