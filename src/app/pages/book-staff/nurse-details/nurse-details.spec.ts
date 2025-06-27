import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseDetails } from './nurse-details';

describe('NurseDetails', () => {
  let component: NurseDetails;
  let fixture: ComponentFixture<NurseDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NurseDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
