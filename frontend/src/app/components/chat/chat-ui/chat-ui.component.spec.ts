import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUiComponentOld } from './chat-ui.component';

describe('ChatUiComponentOld', () => {
  let component: ChatUiComponentOld;
  let fixture: ComponentFixture<ChatUiComponentOld>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUiComponentOld]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatUiComponentOld);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
