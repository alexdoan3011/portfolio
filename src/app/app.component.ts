import {Component, ViewEncapsulation, AfterViewInit, OnInit} from '@angular/core';
import Utils, {colors} from "./utils";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'portfolio';


  ngOnInit(): void {
    Array.from(colors.entries()).forEach(([name, value]) => {
      document.body.style.setProperty(`--${name}`, value);
    })
  }

  ngAfterViewInit(): void {
    window.onresize = () => Utils.updateViewSize();
  }
}
