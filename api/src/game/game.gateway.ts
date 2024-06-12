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
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Room} from './Room';

var colCheck: boolean = false;
var numOfRooms: number = 0;
var roomMap = new Map<string, Room>();

@WebSocketGateway({cors: { origin: "http:localhost:4200/"}, namespace: "/game"})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(private readonly matchService: MatchService) {}
	
	afterInit(server: any) 
	{
		console.log("server started");
	}

	handleConnection(client: Socket)
	{
		console.log("gameGateway: ", client.id, " has connected");
	}

	handleDisconnect(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			console.log(room.name, "has ended");
			clearInterval(room.stopInterval);
			if ((client == room.rightPlayer) && (room.leftPlayer != null))
				room.leftPlayer.emit("playerwin", room.leftPlayer.id);
			if ((client == room.leftPlayer) && (room.rightPlayer != null))
				room.rightPlayer.emit("playerwin", room.rightPlayer.id);
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
			client.emit("assignNumber", 2);
			client.join(roomName);
			client.data.room = roomName;
			client.in(roomName).emit("assignNumber", 1)
			roomObj.hasStarted = true;
			roomObj.rightPlayer = client;
			roomObj.serverRef = this.server;

			roomObj.serverRef.in(roomName).emit("assignNames", 
				// [roomObj.leftPlayer.id, client.id]
				["Emily", "David"]
			);
			roomObj.serverRef.in(roomName).emit("startSignal");
			setTimeout(() =>{{
			roomObj.stopInterval = setInterval(this.updateBall, 20, roomObj);
		}},4000);
			stop = true;
		}})
		if (stop == false)
			this.createRoom(client, inviteKey);
	}

	createRoom(client: Socket, inviteKey: number)
	{
		client.join("room"+numOfRooms);
		client.data.room = "room"+numOfRooms;
		roomMap.set("room"+numOfRooms, new Room);
		var room = roomMap.get(client.data.room)
		room.roomKey = inviteKey;
		room.name = "room"+numOfRooms;
		room.leftPlayer = client;

		numOfRooms++;
	}

	@SubscribeMessage("updatePlayer")
	updatePlayer(client: Socket, yPos: number)
	{
		var room = roomMap.get(client.data.room)
		if (client.id == room.leftPlayer.id)
			room.LpyPos = yPos;
		if (client.id == room.rightPlayer.id)
			room.RpyPos = yPos;
		if (colCheck == false)
		{
			colCheck = true;
			room.checkPlayerCollision();
			colCheck = false;
		}
		client.in(room.name).emit("updatePlayerPos", yPos);
	}
	
	// BALLS
	updateBall(room: Room)
	{
		if (room != null)
		{
			room.moveBall();
			if (colCheck == false)
			{
				colCheck = true;
				room.checkPlayerCollision();
				colCheck = false;
			}
			room.checkWallBounce();
			if (room.checkScoring())
				roomMap.delete(room.name);
			else
				room.serverRef.in(room.name).emit("updateBallPos", room.ballPos);
		}
	}
}
