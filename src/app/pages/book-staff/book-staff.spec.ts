import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookStaff } from './book-staff';

describe('BookStaff', () => {
  let component: BookStaff;
  let fixture: ComponentFixture<BookStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
