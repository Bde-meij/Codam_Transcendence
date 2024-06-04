import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomComponent } from './chat-room.component';

describe('ChatRoomComponent', () => {
  let component: ChatRoomComponent;
  let fixture: ComponentFixture<ChatRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatRoomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { ChatComponent } from './chat.component';

// describe('ChatComponent', () => {
//   let component: ChatComponent;
//   let fixture: ComponentFixture<ChatComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [ChatComponent]
//     })
//     .compileComponents();
    
//     fixture = TestBed.createComponent(ChatComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
