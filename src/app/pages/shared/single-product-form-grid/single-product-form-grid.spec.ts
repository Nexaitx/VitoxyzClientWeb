import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleProductFormGrid } from './single-product-form-grid';

describe('SingleProductFormGrid', () => {
  let component: SingleProductFormGrid;
  let fixture: ComponentFixture<SingleProductFormGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleProductFormGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleProductFormGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
