import { Label, Color, TextAlign, Font } from "excalibur";

export class Texts
{

	timer = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "3",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 80,
		  }),
	})
	
	wait = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "Awaiting other players...",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	
	win = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	
	abort = new Label({
		color: Color.White,
		text: "game aborted",
		x: 400,
		y: 125,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	
	lives = new Label({
		color: Color.White,
		text: "6",
		x: 100,
		y: 700,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 80,
		  }),
	})
}
