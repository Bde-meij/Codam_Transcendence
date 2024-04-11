import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage, AppComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
	title = '';
}
