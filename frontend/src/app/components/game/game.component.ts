import { Component, OnInit } from '@angular/core';
import {Engine} from 'excalibur';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
	title = "my game";

	constructor(){};

    ngOnInit(){
        var engine = new Engine({
            canvasElementId: "game",
            width: 100,
            height: 100            
        });
        engine.start();
    }
}
