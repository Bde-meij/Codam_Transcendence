import { Label, Color, TextAlign, Font } from "excalibur";

export class Texts
{
	leftPNameText = new Label({
		color: Color.White,
		x: 200,
		y: 20,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 25,
		  }),
	})
	
	rightPNameText = new Label({
		color: Color.White,
		x: 600,
		y: 20,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 25,
		  }),
	})
	
	timerText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "3",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 80,
		  }),
	})
	
	waitText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "Awaiting other player...",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	
	winText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	
	abortText = new Label({
		color: Color.White,
		text: "game aborted",
		x: 400,
		y: 125,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
}
