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
import { IntroductionAnimateComponent } from './introduction-animate/introduction-animate.component';
import { WindowComponent } from './window/window.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    AppComponent,
    GreetingComponent,
    ConfettiComponent,
    NotFoundComponent,
    GreetingBgComponent,
    HomeComponent,
    IntroductionAnimateComponent,
    WindowComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    NgScrollbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
