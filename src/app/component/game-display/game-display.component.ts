import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WakeLockService } from 'src/app/service/wake-lock.service';

@Component({
  selector: 'app-game-display',
  templateUrl: './game-display.component.html',
  styleUrls: ['./game-display.component.scss']
})
export class GameDisplayComponent implements OnInit {

  displayCamera = false;
  screenAwake = false;
  showNextPointMessage = false;

  constructor(
    private wakeLockService: WakeLockService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if (!this.wakeLockService.screenWakeLocked)
      this.wakeLockService.wakeLock();
  }

  toggleCamera(): void {
    this.displayCamera = !this.displayCamera;
  }

  scanSuccess(result: string): void {
    this.displayCamera = false;

    let queryParams: any = {};

    var query = result.substring(result.indexOf("?") + 1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      queryParams[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: queryParams });
    this.playSuccess();

    this.showNextPointMessage = true;
    setTimeout(() => {
      this.showNextPointMessage = false;
    }, 5000);
  }

  private playSuccess(): void {
    let audio = new Audio();
    audio.src = "assets/tada-fanfare-a-6313.mp3";
    audio.load();
    audio.play();
  }

}
