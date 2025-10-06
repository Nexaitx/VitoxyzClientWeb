import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileFooterNav } from './mobile-footer-nav';

describe('MobileFooterNav', () => {
  let component: MobileFooterNav;
  let fixture: ComponentFixture<MobileFooterNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileFooterNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileFooterNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
