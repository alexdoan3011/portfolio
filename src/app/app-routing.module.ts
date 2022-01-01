import { NgModule } from '@angular/core';
import {Routes, RouterModule, ActivatedRouteSnapshot} from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';


const routes: Routes = [
  {path: 'old', component: NotFoundComponent, resolve: {
      url: 'externalUrlRedirectResolver'
    },
    data: {
      externalUrl: '/old'
    }},
  {path: 'linkedIn', component: NotFoundComponent, resolve: {
      url: 'externalUrlRedirectResolver'
    },
    data: {
      externalUrl: 'https://www.linkedin.com/in/van-nam-doan-48b0a3196/'
    }},
  {path: 'discord', component: NotFoundComponent, resolve: {
      url: 'externalUrlRedirectResolver'
    },
    data: {
      externalUrl: 'https://discordapp.com/users/350233804159320064/'
    }},
  {path: 'facebook', component: NotFoundComponent, resolve: {
      url: 'externalUrlRedirectResolver'
    },
    data: {
      externalUrl: 'https://www.facebook.com/alexdoan30/'
    }},
  {path: 'github', component: NotFoundComponent, resolve: {
      url: 'externalUrlRedirectResolver'
    },
    data: {
      externalUrl: 'https://github.com/alexdoan3011/'
    }},
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
  providers: [
    {
      provide: 'externalUrlRedirectResolver',
      useValue: (route: ActivatedRouteSnapshot) =>
      {
        window.location.href = (route.data as any).externalUrl;
      }
    }
  ]
})
export class AppRoutingModule { }
