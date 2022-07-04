import { Component } from '@angular/core';
import { Result } from '@zxing/library';
import { AppVersion } from './app-version';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'scavenger-hunt';

  getVersion(): string {
    return AppVersion.VERSION;
  }

}
