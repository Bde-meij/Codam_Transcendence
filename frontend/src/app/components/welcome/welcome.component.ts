import { Component, OnInit} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
	height = 600;
	width = this.height * 1;
	title = '';

	clicked = false;

	constructor(route: ActivatedRoute) {
		route.data.subscribe(data =>
			this.title = data['title']
		)
	}

	ngOnInit() {
		this.clicked = false;
	}

	login() :void {
		if (this.clicked == false) {
			this.clicked = true;
			window.location.href = '/api/auth/login';
		}
	}
}
