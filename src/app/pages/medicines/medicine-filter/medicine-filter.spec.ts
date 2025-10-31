import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineFilter } from './medicine-filter';

describe('MedicineFilter', () => {
  let component: MedicineFilter;
  let fixture: ComponentFixture<MedicineFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
