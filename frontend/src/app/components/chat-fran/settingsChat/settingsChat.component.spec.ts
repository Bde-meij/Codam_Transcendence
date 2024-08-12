import { ComponentFixture, TestBed } from '@angular/core/testing';

import { settingsChat } from './settingsChat.component';

describe('ModalContentComponent', () => {
  let component: settingsChat;
  let fixture: ComponentFixture<settingsChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [settingsChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(settingsChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
