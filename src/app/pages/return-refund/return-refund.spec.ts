import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnRefund } from './return-refund';

describe('ReturnRefund', () => {
  let component: ReturnRefund;
  let fixture: ComponentFixture<ReturnRefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnRefund]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnRefund);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
