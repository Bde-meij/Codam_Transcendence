import { ComponentFixture, TestBed } from '@angular/core/testing';

import { protectedChat } from './protectedChat.component';

describe('ModalContentComponent', () => {
  let component: protectedChat;
  let fixture: ComponentFixture<protectedChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [protectedChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(protectedChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
