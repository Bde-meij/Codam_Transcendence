import { Component} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage, LoginComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
	height = 600;
	width = this.height * 1;
	title = '';

	constructor(route: ActivatedRoute) {
		route.data.subscribe(data =>
			this.title = data['title']
		)
	}
}
