import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeeraAi } from './meera-ai';

describe('MeeraAi', () => {
  let component: MeeraAi;
  let fixture: ComponentFixture<MeeraAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeeraAi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeeraAi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
