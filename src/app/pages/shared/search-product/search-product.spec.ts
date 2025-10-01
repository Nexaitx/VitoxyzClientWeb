import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProduct } from './search-product';

describe('SearchProduct', () => {
  let component: SearchProduct;
  let fixture: ComponentFixture<SearchProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
