import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export type DeviceType = 'Mobile' | 'Tablet' | 'Desktop';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  deviceType: DeviceType = 'Desktop';

  constructor(private breakpointObserver: BreakpointObserver) {
    this.detectDevice();
  }

  private detectDevice(): void {
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).subscribe(result => {

      if (result.breakpoints[Breakpoints.Handset]) {
        this.deviceType = 'Mobile';
      }
      else if (result.breakpoints[Breakpoints.Tablet]) {
        this.deviceType = 'Tablet';
      }
      else {
        this.deviceType = 'Desktop';
      }

    });
  }

  getDeviceType(): DeviceType {
    return this.deviceType;
  }

  isMobile(): boolean {
    return this.deviceType === 'Mobile';
  }

  isTablet(): boolean {
    return this.deviceType === 'Tablet';
  }

  isDesktop(): boolean {
    return this.deviceType === 'Desktop';
  }
}
