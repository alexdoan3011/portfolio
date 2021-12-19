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

@NgModule({
  declarations: [
    AppComponent,
    GreetingComponent,
    ConfettiComponent,
    NotFoundComponent,
    GreetingBgComponent,
    HomeComponent,
    IntroductionAnimateComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
