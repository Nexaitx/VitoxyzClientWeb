import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookNurse } from './book-nurse';

describe('BookNurse', () => {
  let component: BookNurse;
  let fixture: ComponentFixture<BookNurse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookNurse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookNurse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
