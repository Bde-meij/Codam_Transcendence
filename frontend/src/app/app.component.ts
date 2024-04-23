import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestAuthService } from './services/testauth/testauth.service';
import { User } from './models/user.class';
import { AsyncPipe, JsonPipe, NgFor } from '@angular/common';
import { Observable, map } from 'rxjs';
import { GameService, Positions } from './services/game/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, NgFor, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
	users$:Observable<User[]> | undefined;
	pos$:Observable<Positions> | undefined;

	// pos : Positions | undefined;

	title="gary";


	subpos: Positions | undefined;

	constructor(private testauthService: TestAuthService, private gameService: GameService) {
	};


	ngOnInit() {
		// this.games$ = this.gameService.getPos();
		this.pos$ = this.gameService.getPos();

		this.users$ = this.testauthService.getTest();

		this.gameService.getPos().subscribe(data => this.subpos = {
			yPosP1 : data.yPosP1,
			yPosP2 : data.yPosP2,
		})
	};

	public mykeyup() {
		this.gameService.upKey("2", "1").subscribe();
		this.getPos();
	};
	public mykeydown() {
		this.gameService.downKey("1", "1").subscribe();
		this.getPos();
	};

	public getPos() : void {
		if (this.pos$) {
			this.pos$.subscribe(data => this.subpos = {
				yPosP1 : data.yPosP1,
				yPosP2 : data.yPosP2,
			})
		}
	};
}
