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

	mypos : Positions | undefined =  {yPosP1:0, yPosP2:0};
	

	constructor(private testauthService: TestAuthService, private gameService: GameService) {
	};


	ngOnInit() {
		// this.games$ = this.gameService.getPos();
		this.pos$ = this.gameService.getPos()
			.pipe(map(data => (this.mypos = {
			yPosP1 : data.yPosP1,
			yPosP2 : data.yPosP2,
		})))

		this.users$ = this.testauthService.getTest();
	};

	public mykeyup() {
		this.gameService.keyUp("2", "1").subscribe();
	}
	public mykeydown() {
		this.gameService.keyDown("1", "1").subscribe();
	}

}
