import { Label, Color, TextAlign, Font } from "excalibur";

export var leftPNameText = new Label({
	color: Color.White,
	x: 200,
	y: 20,
	font: new Font({
		textAlign: TextAlign.Center,
		size: 25,
	  }),
})

export var rightPNameText = new Label({
	color: Color.White,
	x: 600,
	y: 20,
	font: new Font({
		textAlign: TextAlign.Center,
		size: 25,
	  }),
})

export var timerText = new Label({
	color: Color.White,
	x: 400,
	y: 250,
	text: "3",
	font: new Font({
		textAlign: TextAlign.Center,
		size: 80,
	  }),
})

export var waitText = new Label({
	color: Color.White,
	x: 400,
	y: 250,
	text: "Awaiting other player...",
	font: new Font({
		textAlign: TextAlign.Center,
		size: 40,
	  }),
})

export var winText = new Label({
	color: Color.White,
	x: 400,
	y: 250,
	font: new Font({
		textAlign: TextAlign.Center,
		size: 40,
	  }),
})

export var abortText = new Label({
	color: Color.White,
	x: 400,
	y: 125,
	font: new Font({
		textAlign: TextAlign.Center,
		size: 40,
	  }),
})