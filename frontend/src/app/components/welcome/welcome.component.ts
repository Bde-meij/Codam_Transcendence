import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage, ChatComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
	name = "astrid";

}
