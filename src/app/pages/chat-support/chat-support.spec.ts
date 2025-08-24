import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSupport } from './chat-support';

describe('ChatSupport', () => {
  let component: ChatSupport;
  let fixture: ComponentFixture<ChatSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
