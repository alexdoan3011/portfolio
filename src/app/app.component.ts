import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';
import Utils from "./utils";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements AfterViewInit {
  title = 'portfolio';

  ngAfterViewInit(): void {
    window.onresize = () => Utils.updateViewSize();
  }
}
