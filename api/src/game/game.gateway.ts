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

import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { NotAcceptableException, Req } from '@nestjs/common';
import { Injectable } from '@nestjs/common';


var colCheck: boolean = false;
var numOfRooms: number = 0;
var roomMap = new Map<string, Room>();

@Injectable()
@WebSocketGateway({cors: { origin: "http:localhost:4200/"}, namespace: "/game"})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(private authService: AuthService, private userService: UserService, private gameService: GameService) {}
	
	afterInit(server: any) 
	{
		console.log("server started");
	}

	// handleConnection(client: Socket)
	// {
	// 	console.log("gameGateway: ", client.id, " has connected");
	// }

	async handleConnection(client: Socket) {
		try {
			console.log("handleConnection: " + client.id + "connecting...");
			const cookies = client.handshake.headers.cookie?.split('; ');
			if (!cookies)
				throw new NotAcceptableException();
			var token: string;
			for (var cookie of cookies) {
				const [key, value] = cookie.split('=');
				// console.log(value);
				if (key === 'access_token') {
					token = value;
					break;
				}
			}
			if (!token)
				throw new NotAcceptableException();
			const payload = await this.authService.verifyJwtAccessToken(token);
			const user = await this.userService.findUserById(payload.id);
			if (!user)
				throw new NotAcceptableException();
			client.data.nickname = user.nickname;
			client.data.id = user.id;

			console.log("nickname: " + client.data.nickname)
			console.log("useriD: " + user.id)
		} catch {
			console.log(client.id, "connection refused");
			client.disconnect();
			return;
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

	handleDisconnect(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			console.log(room.name, "has ended");
			clearInterval(room.stopInterval);
			if ((client.id == room.rightPlayer.id) && (room.leftPlayer != null))
				room.leftPlayer.emit("playerwin", room.leftPlayer.id);
			if ((client.id == room.leftPlayer.id) && (room.rightPlayer != null))
				room.rightPlayer.emit("playerwin", room.rightPlayer.id);
			roomMap.delete(room.name);
		}
		console.log(client.id, "has disconnected");
	}

	// INITIALIZATIONS

	@SubscribeMessage("joinRoom")
	joinRoom(client: Socket)
	{
		console.log("joinroom game: " + client.data.id);
		var roomName = this.findRoomByPlayer(client.data.id)
		console.log("roomname:" + roomName);
		if (roomName != null)
		{
			var room = roomMap.get(roomName);
			if (room.leftId == client.data.id)
			{
				client.join(roomName)
				client.data.room = roomName;
				room.leftPlayer = client;
				room.serverRef = this.server;
			}
			else if(room.rightId == client.data.id)
			{
				client.emit("assignNumber", 2);
				client.join(roomName);
				client.data.room = roomName;
				client.in(roomName).emit("assignNumber", 1)
				room.hasStarted = true;
				room.rightPlayer = client;
				room.serverRef = this.server;
	
				room.serverRef.in(roomName).emit("assignNames", 
					[room.leftId, room.rightId]
				);
				room.serverRef.in(roomName).emit("startSignal");
				setTimeout(() =>{{
				room.stopInterval = setInterval(this.updateBall, 20, room);
				}},4000);
			}
		}
		else
		{
			var stop: boolean = false;
			roomMap.forEach((roomObj, roomName) =>{
			if ((roomObj.hasStarted == false) && (stop == false))
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
				this.createRoom(client);
		}
	}

	createRoom(client: Socket)
	{
		console.log(client.data.nickname, "has created room");
		client.join("room"+numOfRooms);
		client.data.room = "room"+numOfRooms;
		roomMap.set("room"+numOfRooms, new Room);
		var room = roomMap.get(client.data.room)
		room.name = "room"+numOfRooms;
		room.leftPlayer = client;

		numOfRooms++;
	}

	@SubscribeMessage("updatePlayer")
	updatePlayer(client: Socket, yPos: number)
	{
		var room = roomMap.get(client.data.room)
		if (client.id == room.leftPlayer.id)
			room.leftPos = yPos;
		if (client.id == room.rightPlayer.id)
			room.rightPos = yPos;
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

	findRoomByPlayer(userID: number) : string
	{
		roomMap.forEach((roomObj, roomName) =>
		{
			if ((userID == roomObj.leftId) || (userID == roomObj.leftId))
				return (roomName);
		});
		return (null);
	}
}

export function setInvRoom(userID: number)
{
	numOfRooms++;
	roomMap.set("room"+numOfRooms, new Room);
	var room = roomMap.get("room"+numOfRooms)
	room.name = "room"+numOfRooms;
	room.leftId = userID;
	console.log(userID, "reserved spot in", room.name);
	return (numOfRooms);
}

export function joinInvRoom(useriD: number, roomNum: number)
{
	var room = roomMap.get("room"+roomNum);
	room.rightId = useriD;
	console.log(useriD, "reserved spot in", "room"+roomNum);
}
