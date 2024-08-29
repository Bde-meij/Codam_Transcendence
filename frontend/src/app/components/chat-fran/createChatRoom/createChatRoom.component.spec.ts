import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createChatRoom } from './createChatRoom.component';

describe('ModalContentComponent', () => {
  let component: createChatRoom;
  let fixture: ComponentFixture<createChatRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [createChatRoom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(createChatRoom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
