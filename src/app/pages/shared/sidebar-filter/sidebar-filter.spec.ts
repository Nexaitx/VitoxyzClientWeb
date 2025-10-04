import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFilter } from './sidebar-filter';

describe('SidebarFilter', () => {
  let component: SidebarFilter;
  let fixture: ComponentFixture<SidebarFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
