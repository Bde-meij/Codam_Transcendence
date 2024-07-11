import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
	height : number = 400;
	width : number = 400;

	ngOnInit(): void {
		this.screenResize();
	}

	onResize(event: any) {
		console.log("event: ", event);
		// window.innerWidth = event.target.innerWidth;
		// window.innerHeight = event.target.innerHeight;
		this.screenResize();
	}

	screenResize()
	{
		if (window.innerWidth < window.innerHeight) {
			console.log("innerWidth smallest");
			this.width = window.innerWidth - 10, 
			this.height = window.innerWidth - 10;
		} else {
			console.log("innerHeight smallest");
			this.width = window.innerHeight - 10;
			this.height = window.innerHeight - 10;
		}
	}
}
