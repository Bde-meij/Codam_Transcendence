import { Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AppComponent } from '../../app.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage, AppComponent, LoginComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
	height = 600;
	width = this.height * 1.15;
	@Input() title = '';
}
