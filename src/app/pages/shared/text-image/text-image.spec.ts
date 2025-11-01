import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextImage } from './text-image';

describe('TextImage', () => {
  let component: TextImage;
  let fixture: ComponentFixture<TextImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
