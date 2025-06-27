import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookPsychiatrist } from './book-psychiatrist';

describe('BookPsychiatrist', () => {
  let component: BookPsychiatrist;
  let fixture: ComponentFixture<BookPsychiatrist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPsychiatrist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookPsychiatrist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
