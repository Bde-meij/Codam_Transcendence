import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SquareBall} from './SquareBall';

var playerNumber: number = 0;
var numOfGameRooms: number = 0;

var roomballmap = new Map<string, SquareBall>();

async function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms));
}

@WebSocketGateway({cors: { origin: "http:localhost:4200/"}, namespace: "/game"})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(private readonly gameService: GameService) {}
	
	afterInit(server: any) 
	{
		console.log("server started");
	}

	handleConnection(client: Socket)
	{
		console.log("gameGateway: ", client.id, " has connected");
	}

	@SubscribeMessage('createGame')
	create(@MessageBody() createGameDto: CreateGameDto)
	{
		return this.gameService.create(createGameDto);
	}

	@SubscribeMessage('findAllGame')
	findAll()
	{
		return this.gameService.findAll();
	}

	@SubscribeMessage('findOneGame')
	findOne(@MessageBody() id: number)
	{
		return this.gameService.findOne(id);
	}

	@SubscribeMessage('updateGame')
	update(@MessageBody() updateGameDto: UpdateGameDto)
	{
		return this.gameService.update(updateGameDto.id, updateGameDto);
	}

	@SubscribeMessage('removeGame')
	remove(@MessageBody() id: number) 
	{
		return this.gameService.remove(id);
	}

	handleDisconnect(client: any)
	{
		console.log(client.id, "has disconnected");
		playerNumber--;
	}

	// PLAYERS
	@SubscribeMessage("assignPlayer")
	assignPlayer(client: Socket)
	{
		playerNumber+=1;
		client.join("gameroom"+numOfGameRooms);
		client.data.room = "gameroom"+numOfGameRooms;
		client.emit("assignPlayerNum", playerNumber);
		if (playerNumber == 2)
		{
			roomballmap.set(client.data.room, new SquareBall);
			playerNumber = 0;
			numOfGameRooms+=1;
		}
	}

	@SubscribeMessage('updatePlayer')
	updatePlayer(client: Socket, arg: number)
	{
		client.in(client.data.room).emit("updatePlayerPos", arg);
	}

	// BALLS
	@SubscribeMessage('updateBall')
	updateBall(client: Socket)
	{
		var ball = roomballmap.get(client.data.room)
		ball.move();
		if ((ball.position[0] < 0) || (ball.position[0] > 800))
			this.checkScore(client);
		if ((ball.position[1] < 5) || (ball.position[1] > 795))
			this.wallbounce(ball);
		this.server.in(client.data.room).emit("updateBallPos", ball.position);
	}

	checkScore(client: Socket)
	{
		var room = client.data.room;
		var ball = roomballmap.get(client.data.room)
		if (ball.position[0] < 0)
		{
			ball.rScore+=1;
			this.server.in(room).emit("updateScore", [ball.lScore, ball.rScore]);
			if (ball.rScore == 11) 
			{
				// alert("right player win!");
				this.server.in(room).emit("right win");
				(ball.rScore = 0), (ball.rScore = 0);
			}
			this.resetball(ball, -1);
		}
		else if  (ball.position[0] > 800)
		{
			ball.lScore+=1;
			this.server.in(room).emit("updateScore", [ball.lScore, ball.rScore]);
			if (ball.lScore == 11) 
			{
				// alert("right player win!");
				this.server.in(room).emit("left win");
				(ball.lScore = 0), (ball.rScore = 0);
			}
			this.resetball(ball, 1);
		}
	}

	wallbounce(ball: SquareBall)
	{
		ball.speed[1] *= -1;
		if ((ball.speed[1]*ball.speed[1]) < 4)
			ball.speed[1] *= 10;
	}

	resetball(ball: SquareBall, mod: number)
	{
		ball.speed[0] = 0;
		ball.speed[1] = 0;
		ball.position[0] = 400;
		ball.position[1] = 300;
		setTimeout(() =>{ball.speed[0] = 10*mod;},1000)
	}

	@SubscribeMessage('playerbounce')
	playerbounce(client: Socket, mod: number)
	{
		roomballmap.get(client.data.room).speed[0] *= -1;
		roomballmap.get(client.data.room).speed[1] += mod;
	}
}

// 	setTimeout(()=> {
// 		roomballmap.forEach((ball,room) =>{
// 			ball.move();
// 			this.server.in(room).emit("updateBallPos", ball.position);
// 		})