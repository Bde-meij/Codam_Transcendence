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
import { Room} from './Room';

var numOfRooms: number = 0;
var roomMap = new Map<string, Room>();

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

	handleDisconnect(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			console.log(room.name, "has ended");
			if (client.id == room.rightPlayer)
				this.server.in(room.name).emit("playerwin", room.leftPlayer);
			if (client.id == room.leftPlayer)
				this.server.in(room.name).emit("playerwin", room.rightPlayer);
			roomMap.delete(room.name);
		}
		console.log(client.id, "has disconnected");
	}

	// INITIALIZATIONS

	@SubscribeMessage("joinRoom")
	joinRoom(client: Socket, inviteKey: number)
	{
		var stop: boolean = false;

		roomMap.forEach((roomObj, roomName) =>{
		if ((inviteKey == roomObj.roomKey) && (roomObj.hasStarted == false) && (stop == false))
		{
			client.emit("assignPlayerNum", 2);
			client.join(roomName);
			client.data.room = roomName;
			roomObj.hasStarted = true;
			roomObj.rightPlayer = client.id;
			stop = true;
		}})
		if (stop == false)
			this.createRoom(client, inviteKey);
	}

	createRoom(client: Socket, inviteKey: number)
	{
		client.emit("assignPlayerNum", 1);
		client.join("room"+numOfRooms);
		client.data.room = "room"+numOfRooms;
		roomMap.set("room"+numOfRooms, new Room);
		var room = roomMap.get(client.data.room)
		room.roomKey = inviteKey;
		room.name = "room"+numOfRooms;
		room.leftPlayer = client.id;

		numOfRooms++;
	}

	@SubscribeMessage("updatePlayer")
	updatePlayer(client: Socket, yPos: number)
	{
		client.in(client.data.room).emit("updatePlayerPos", yPos);
	}
	
	// BALLS
	@SubscribeMessage('updateBall')
	updateBall(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			room.moveBall();
			if ((room.ballPos[0] < 0) || (room.ballPos[0] > 800))
				this.checkScore(client);
			if ((room.ballPos[1] < 5) || (room.ballPos[1] > 595))
				room.wallBounce();
			this.server.in(client.data.room).emit("updateBallPos", room.ballPos);
		}
	}

	checkScore(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			if (room.ballPos[0] < 0)
			{
				room.rScore+=1;
				this.server.in(client.data.room).emit("updateScore", [room.lScore, room.rScore]);
				room.resetBall(-1);
				if (room.rScore == 11)
				{
					this.server.in(room.name).emit("playerwin", room.rightPlayer);
					roomMap.delete(room.name);
				}
			}
			else if  (room.ballPos[0] > 800)
			{
				room.lScore+=1;
				this.server.in(client.data.room).emit("updateScore", [room.lScore, room.rScore]);
				room.resetBall(1);
				if (room.lScore == 11)
				{
					this.server.in(room.name).emit("playerwin", room.leftPlayer);
					roomMap.delete(room.name);
				}
			}
		}
	}

	@SubscribeMessage('playerbounce')
	playerbounce(client: Socket, mod: number)
	{
		roomMap.get(client.data.room).playerBounce(mod);
	}
}

// 	setTimeout(()=> {
		// roomMap.forEach((ball,room) =>{
		// 	ball.move();
		// 	this.server.in(room).emit("updateBallPos", ball.ballPos);
// 		})