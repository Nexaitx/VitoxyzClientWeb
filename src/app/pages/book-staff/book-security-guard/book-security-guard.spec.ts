import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSecurityGuard } from './book-security-guard';

describe('BookSecurityGuard', () => {
  let component: BookSecurityGuard;
  let fixture: ComponentFixture<BookSecurityGuard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookSecurityGuard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookSecurityGuard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
