import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Multiproductsform } from './multiproductsform';

describe('Multiproductsform', () => {
  let component: Multiproductsform;
  let fixture: ComponentFixture<Multiproductsform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Multiproductsform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Multiproductsform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
