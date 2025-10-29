import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleProductForm } from './single-product-form';

describe('SingleProductForm', () => {
  let component: SingleProductForm;
  let fixture: ComponentFixture<SingleProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleProductForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
