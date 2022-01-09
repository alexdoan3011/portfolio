import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {GreetingComponent} from './greeting/greeting.component';
import {GreetingBgComponent} from './greeting-bg/greeting-bg.component';
import {ConfettiComponent} from './confetti/confetti.component';
import {RouterModule} from "@angular/router";
import {NotFoundComponent} from './not-found/not-found.component';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import { BorderAnimateComponent } from './border-animate/border-animate.component';
import { WindowComponent } from './window/window.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ContactMeComponent } from './contact-me/contact-me.component';
import { AvatarAnimateComponent } from './avatar-animate/avatar-animate.component';
import { ProjectsComponent } from './projects/projects.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { ResumeComponent } from './resume/resume.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationCardComponent } from './navigation-card/navigation-card.component';
import { IframeWrapperComponent } from './iframe-wrapper/iframe-wrapper.component';

@NgModule({
  declarations: [
    AppComponent,
    GreetingComponent,
    ConfettiComponent,
    NotFoundComponent,
    GreetingBgComponent,
    HomeComponent,
    BorderAnimateComponent,
    WindowComponent,
    ContactMeComponent,
    AvatarAnimateComponent,
    ProjectsComponent,
    AboutMeComponent,
    ResumeComponent,
    NavigationComponent,
    NavigationCardComponent,
    IframeWrapperComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    NgScrollbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
