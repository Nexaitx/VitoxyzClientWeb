import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBanner } from './text-banner';

describe('TextBanner', () => {
  let component: TextBanner;
  let fixture: ComponentFixture<TextBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
