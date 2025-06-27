import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocateNurse } from './locate-nurse';

describe('LocateNurse', () => {
  let component: LocateNurse;
  let fixture: ComponentFixture<LocateNurse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocateNurse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocateNurse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
