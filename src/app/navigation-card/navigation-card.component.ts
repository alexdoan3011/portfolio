import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Utils from "../utils";

@Component({
  selector: 'app-navigation-card',
  templateUrl: './navigation-card.component.html',
  styleUrls: ['./navigation-card.component.scss']
})
export class NavigationCardComponent implements OnInit {
  @Output() clicked: EventEmitter<any> = new EventEmitter();
  @Input() header: string = '';
  @Input() shortDescription: string = '';
  @Input() imgUrl: string = '';
  @Input() imgScale = 1;
  @Input() bgColor: any;
  @Input() gradient = true;
  @Input() rowDisplay = false;
  @Input() top = false;

  constructor(public elementRef:ElementRef) {
  }

  ngOnInit(): void {
    if (!this.bgColor) {
      this.bgColor = Utils.getMyColor('myDark');
    } else {
      this.bgColor = Utils.getMyColor(this.bgColor);
    }
  }
}
