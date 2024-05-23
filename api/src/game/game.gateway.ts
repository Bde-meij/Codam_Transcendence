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
var squareBall = new SquareBall;

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
		// if (playerNumber%2 == 0)
		// 	numOfGameRooms+=1;
		playerNumber+=1;
		console.log("gameGateway: ", client.id, " has connected, playernum", playerNumber, "on room", "gameroom"+numOfGameRooms);
		client.emit("assignPlayer", playerNumber);
		client.join("gameroom"+numOfGameRooms);
		if (playerNumber == 2)
			{
				console.log("SHOULD START");
				this.server.to("gameroom"+numOfGameRooms).emit("startGame");
			}
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
	@SubscribeMessage('updatePlayer')
	updatePlayer(client: Socket, arg: number)
	{
		client.in("gameroom"+numOfGameRooms).emit("updatePlayerPos", arg);
	}

	// BALLS
	@SubscribeMessage('updateBall')
	updateBall(client: Socket)
	{
		squareBall.move();
		// if ((squareBall.position[0] > 700) || (squareBall.position[0] < 100))
		//   squareBall.speed[0] *= -1;
		this.server.in("gameroom"+numOfGameRooms).emit("updateBallPos", 
		squareBall.position);
	}

	@SubscribeMessage('resetball')
	resetball(client: Socket, mod: number)
	{
		squareBall.speed[0] = 0;
		squareBall.speed[1] = 0;
		squareBall.position[0] = 400;
		squareBall.position[1] = 300;
		setTimeout(() =>{squareBall.speed[0] = 10*mod;},1000);
		// if ((squareBall.position[0] > 700) || (squareBall.position[0] < 100))
		//   squareBall.speed[0] *= -1;
	}

	@SubscribeMessage('wallbounce')
	wallbounce(client: Socket)
	{
		squareBall.speed[1] *= -1;
		if ((squareBall.speed[1]*squareBall.speed[1]) < 4)
			squareBall.speed[1] *= 10;
	}

	@SubscribeMessage('playerbounce')
	playerbounce(client: Socket, mod: number)
	{
		console.log("modder = ", mod);
		squareBall.speed[0] *= -1;
		squareBall.speed[1] += mod;
		//   if ((squareBall.speed[0]*squareBall.speed[0]) < 4)
		//     squareBall.speed[0] *= 10;
	}
}

// OLD TESTS
// @SubscribeMessage('space')
// lol(client: Socket, arg: string)
// {
// 	console.log(client.id, "says:", arg);
// }