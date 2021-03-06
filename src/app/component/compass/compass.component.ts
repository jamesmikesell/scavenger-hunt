import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { headingDistanceTo } from 'geolocation-utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { field } from 'geomag';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.scss']
})
export class CompassComponent implements OnInit, OnDestroy {
  private destroy = new Subject<void>();

  screenMinSize = 24;
  title = "";
  latitude = 0;
  longitude = 0;
  alpha = 0;
  headingToDestination = 0;
  distanceToDestination = 0
  destination: Location = { lat: 0, lon: 0 };
  beta: number = 0;
  gama: number = 0;
  triAxisHeading: number = 0;
  declination: number = 0;
  arrowAngle = 0;
  debug = false;


  constructor(
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    navigator.geolocation.watchPosition((data) => this.locationChange(data), null, { enableHighAccuracy: true });

    let minSize = Math.min(window.innerWidth, window.innerHeight);
    this.screenMinSize = minSize;

    this.route.queryParams
      .pipe(takeUntil(this.destroy))
      .subscribe((plainParams) => {
        let params = plainParams as LocationParams;

        this.destination = {
          lat: +params.lat,
          lon: +params.lon
        };

        this.title = params.title;
        this.debug = !!params.debug;
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
    this.alpha = Math.abs(event.alpha || 0);
    this.beta = Math.abs(event.beta || 0);
    this.gama = Math.abs(event.gamma || 0);
    this.triAxisHeading = this.compassHeading(event.alpha || 0, event.beta || 0, event.gamma || 0);
    this.calculateHeading();
  }



  private compassHeading(alpha: number, beta: number, gamma: number): number {

    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    // var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return 360 - compassHeading;

  }





  private calculateHeading(): void {
    const currentLocation = { lat: this.latitude, lon: this.longitude };

    let toDestination = headingDistanceTo(currentLocation, this.destination);
    this.headingToDestination = toDestination.heading;
    this.distanceToDestination = toDestination.distance;


    this.declination = field(this.latitude, this.longitude).declination;

    //Only us triAxis heading if the screen is tilted up closer to vertical
    if (this.beta < 30) {
      this.arrowAngle = this.alpha + this.headingToDestination + this.declination;
    } else {
      this.arrowAngle = this.triAxisHeading + this.headingToDestination + this.declination;
    }
  }

}

interface LocationParams {
  lat: number | string;
  lon: number | string;
  debug: string;
  title: string;
}

interface Location {
  lat: number;
  lon: number;
}
