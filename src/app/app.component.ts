import {Component, ViewEncapsulation, AfterViewInit, OnInit} from '@angular/core';
import Utils from "./utils";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'portfolio';


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    window.onresize = () => Utils.updateViewSize();
    window.onmousemove = (e) => Utils.updateMousePos(e);
  }

  getViewportHeight() {
    return Utils.viewHeight;
  }
}
