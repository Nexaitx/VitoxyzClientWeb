import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookBabySitter } from './book-baby-sitter';

describe('BookBabySitter', () => {
  let component: BookBabySitter;
  let fixture: ComponentFixture<BookBabySitter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookBabySitter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookBabySitter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
