import {Component, ViewEncapsulation, AfterViewInit, OnInit, ViewChildren, QueryList} from '@angular/core';
import Utils from "./utils";
import {WindowComponent} from "./window/window.component";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'portfolio';
  @ViewChildren(WindowComponent) windowComponent!: QueryList<WindowComponent>;


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    window.onresize = () => {
      Utils.windowResize.emit();
      Utils.updateViewSize();
    }
    window.onmousemove = (e) => Utils.updateMousePos(e);
  }

  getViewportHeight() {
    return Utils.viewHeight;
  }
}
