import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPrescription } from './order-prescription';

describe('OrderPrescription', () => {
  let component: OrderPrescription;
  let fixture: ComponentFixture<OrderPrescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPrescription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPrescription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
