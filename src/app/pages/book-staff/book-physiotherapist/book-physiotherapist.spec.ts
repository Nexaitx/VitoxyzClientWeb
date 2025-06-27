import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookPhysiotherapist } from './book-physiotherapist';

describe('BookPhysiotherapist', () => {
  let component: BookPhysiotherapist;
  let fixture: ComponentFixture<BookPhysiotherapist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPhysiotherapist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookPhysiotherapist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
