// import { CreateMatchDto } from './dto/create-match.dto';
// import { UpdateMatchDto } from './dto/update-match.dto';

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

import { Room} from './Room';

import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { NotAcceptableException, Req } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { MatchType } from "./entities/match.entity";

var colCheck: boolean = false;
var numOfRooms: number = 0;
var roomKey: number = 420;
var roomMap = new Map<string, Room>();

@Injectable()
@WebSocketGateway({cors: { origin: "http:localhost:4200/"}, namespace: "/game"})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(private authService: AuthService, private userService: UserService, private readonly matchService: MatchService) {}
	
	afterInit(server: any) 
	{
		// console.log("server started");
		// joinReservedRoom(89413, setReservedRoom(89413));
	}

	// handleConnection(client: Socket)
	// {
		// console.log("gameGateway: ", client.id, " has connected");
	// }

	async handleConnection(client: Socket)
	{
		try 
		{
			// console.log("Game connection: " + client.id);
			var cookies = client.handshake.headers.cookie?.split('; ');
			if (!cookies)
				throw new NotAcceptableException();
			var token: string;
			for (var cookie of cookies)
			{
				var [key, value] = cookie.split('=');
				if (key === 'access_token')
				{
					token = value;
					break;
				}
			}
			if (!token)
				throw new NotAcceptableException();
			var payload = await this.authService.verifyJwtAccessToken(token);
			var user = await this.userService.findUserById(payload.id);
			if (!user)
				throw new NotAcceptableException();
			client.data.userid = user.id;
			client.emit("connectSignal");
		}
		catch
		{
			// console.log(client.id, "Game connection refused");
			client.disconnect();
			return;
		}
	}

	handleDisconnect(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			if (room.hasStarted == true)
				clearInterval(room.stopInterval);
			if ((room.lScore == 0) && (room.rScore == 0))
				room.serverRef.in(room.name).emit("abortGame", client.id);
			else
			{
				if (client.id == room.leftPlayer.id)
					room.rightPlayer.emit("playerwin", room.rightPlayer.id);
				if (client.id == room.rightPlayer.id)
					room.leftPlayer.emit("playerwin", room.leftPlayer.id);
			}
			roomMap.delete(room.name);
		}
		// console.log(client.id, "called handleDisconnect");
	}

	// INITIALIZATIONS
	@SubscribeMessage("joinGame")
	joinGame(client: Socket)
	{
		// console.log("joingame called");
		// if (!this.findReservation(client))
		// {
			if (this.findRoom(client))
				this.startGame(roomMap.get(client.data.room));
			else
				this.createRoom(client);
		// }
	}
	
	// findReservation(client: Socket): boolean
	// {
	// 	roomMap.forEach((roomObj, roomName) =>
	// 	{
	// 		if ((roomObj.leftPlayer == null) && (client.data.userid == roomObj.leftId))
	// 		{
	// 			// console.log(client.id, "found left reservation");
	// 			roomObj.leftPlayer = client;
	// 			client.join(roomName);
	// 			client.data.room = roomName;
	// 			return (true);
	// 		}
	// 		if ((roomObj.rightPlayer == null) && (client.data.userid == roomObj.rightId))
	// 		{
	// 			// console.log(client.id, "found right reservation");
	// 			roomObj.rightPlayer = client;
	// 			client.join(roomName);
	// 			client.data.room = roomName;
	// 			this.startGame(roomObj);
	// 			return (true);
	// 		}
	// 	});
	// 	return (false);
	// }

	// && (roomObj.key == 0) && (roomObj.leftPlayer != null)
	// && roomObj.rightPlayer == null)
	findRoom(client: Socket): boolean
	{
		// console.log(client.id, "called findRoom");
		var stop = false;
		roomMap.forEach((roomObj, roomName) =>
		{
			//ADD: checkRoomKey
			if ((roomObj.hasStarted == false) && (stop == false))
			{
				// console.log(client.id, "joined room", roomName);
				roomObj.rightPlayer = client;
				roomObj.rightId = client.data.userid;
				client.join(roomName);
				client.data.room = roomName;
				stop = true;
			}
		});
		return (stop);
	}

	createRoom(client: Socket)
	{
		roomMap.set("room"+numOfRooms, new Room);
		var room = roomMap.get("room"+numOfRooms);
		room.name = "room"+numOfRooms;
		room.serverRef = this.server;
		room.leftPlayer = client;
		room.leftId = client.data.userid;
		client.join(room.name);
		client.data.room = room.name;
		numOfRooms++;
		// console.log("room", room.name, "created");
	}

	startGame(room: Room)
	{
		// console.log(room.name, "has started");
		room.leftPlayer.emit("assignNumber", 3);
		room.rightPlayer.emit("assignNumber", 4);
		room.hasStarted = true;
		room.serverRef.in(room.name).emit("assignNames", 
		[room.leftPlayer.id, room.rightPlayer.id]);
		setTimeout(() =>{{
			room.stopInterval = setInterval(this.updateBall, 15, room);
		}},4500);
		room.serverRef.in(room.name).emit("startSignal");

		// var mdto: CreateMatchDto;
		// mdto.leftPlayerId = room.leftId.toString();
		// mdto.rightPlayerId = room.rightId.toString();
		// mdto.type = MatchType.PUBLIC;
		// // console.log(mdto.type, "dto created");
		// this.matchService.createMatch(mdto);
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
}

// export function setReservedRoom(userID: number)
// {
// 	roomKey++;
// 	roomMap.set("reservedRoom"+roomKey, new Room);
// 	var room = roomMap.get("reservedRoom"+roomKey)
// 	room.name = "reservedRoom"+roomKey;
// 	room.leftId = userID;
// 	room.key = roomKey;
// 	return (roomKey);
// }

// export function joinReservedRoom(userID: number, key: number): boolean
// {
// 	var room = roomMap.get("reservedRoom"+key);
// 	if (room == null)
// 		return (false);
// 	room.rightId = userID;
// 	return (true);
// }
