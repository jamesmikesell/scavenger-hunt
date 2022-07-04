import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { headingDistanceTo } from 'geolocation-utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.scss']
})
export class CompassComponent implements OnInit, OnDestroy {
  private destroy = new Subject<void>();

  degrees = -90;
  compassSize = 24;

  latitude = 0;
  longitude = 0;
  currentHeading = 0;
  headingToDestination = 0;
  distanceToDestination = 0
  destination: Location = { lat: 0, lon: 0 };
  beta: number = 0;
  gama: number = 0;


  constructor(
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    navigator.geolocation.watchPosition((data) => this.locationChange(data), null, { enableHighAccuracy: true });

    let minSize = Math.min(window.innerWidth, window.innerHeight);
    this.compassSize = minSize * .7;

    this.route.queryParams
      .pipe(takeUntil(this.destroy))
      .subscribe((plainParams) => {
        let params = plainParams as LocationParams;

        this.destination = {
          lat: +params.lat,
          lon: +params.lon
        };
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }


  private locationChange(locationData: GeolocationPosition): void {
    this.latitude = locationData.coords.latitude;
    this.longitude = locationData.coords.longitude;
    this.calculateHeading();
  }


  // @HostListener('window:deviceorientation', ['$event'])
  @HostListener('window:deviceorientationabsolute', ['$event'])
  orientationAndroid(event: DeviceOrientationEvent): void {
    this.currentHeading = Math.abs(event.alpha || 0);
    this.beta = Math.abs(event.beta || 0);
    this.gama = Math.abs(event.gamma || 0);
    this.calculateHeading();
  }

  private calculateHeading(): void {
    const currentLocation = { lat: this.latitude, lon: this.longitude };

    let toDestination = headingDistanceTo(currentLocation, this.destination);
    this.headingToDestination = toDestination.heading;
    this.distanceToDestination = toDestination.distance;

    this.degrees = this.currentHeading;
  }

}

interface LocationParams {
  lat: number | string;
  lon: number | string;
}

interface Location {
  lat: number;
  lon: number;
}
