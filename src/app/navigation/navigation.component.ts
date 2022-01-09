import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import Utils from "../utils";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, AfterContentInit {

  @Output() openApp: EventEmitter<string> = new EventEmitter();
  numRow = 0;
  numItem = 5;

  constructor() {
  }

  ngOnInit(): void {
    Utils.windowResize.subscribe(() => this.getNumRow());
  }

  ngAfterContentInit(): void {
    this.getNumRow();
  }

  getNumRow() {
    const temp = Math.ceil(5 / Math.floor(Utils.viewWidth / 350));
    if (temp != this.numRow) {
      this.numRow = temp;
    }
  }

  isMobile() {
    return Utils.isMobile;
  }

  getViewportHeight() {
    return Utils.viewHeight + 'px';
  }
}
