import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-iframe-wrapper',
  templateUrl: './iframe-wrapper.component.html',
  styleUrls: ['./iframe-wrapper.component.scss']
})
export class IframeWrapperComponent implements OnInit {
  @ViewChild('iframe') iframe!: ElementRef;
  source: string = '';
  url: any;
  iframeHeight = 0

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.source);
  }
}
