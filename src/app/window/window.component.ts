import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import Utils from "../utils";

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, AfterViewInit {
  @Input() content: string[] = [];
  @Input() title: string = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  isMobile() {
    return Utils.mobile;
  }
}
