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
import { Room} from './Room';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { NotAcceptableException, Req } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import {pointDiff, bounce} from "./vectorMath";

var numOfRooms: number = 0;
var roomMap = new Map<string, Room>();

@Injectable()
@WebSocketGateway({cors: { origin: "http:localhost:4200/"}, namespace: "/bossPong"})
export class BossGameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

  @WebSocketServer()
	server: Server;

	constructor(private authService: AuthService, private userService: UserService){};

	afterInit(server: any) 
	{
		console.log("server started");
	}

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
			client.data.nick = user.nickname;
			client.data.key = -1;//user.roomKey;
			console.log(client.data.key);
			client.emit("connectSignal");
		}
		catch
		{
			// console.log(client.id, "Game connection refused");
			client.disconnect();
			return;
		}
	}

	@SubscribeMessage("joinGame")
	joinGame(client: Socket)
	{
		console.log("ONE", client.data.key);
		if (client.data.key < 0)
		{
			console.log("TWO");
			this.createRoom(client);
			this.startGame(client);
		}
		else if (!this.findRoom(client))
			this.createRoom(client);
		else if (roomMap.get(client.data.room).numOfPlayers == 4)
			this.startGame(client);
		console.log("THREE");
	}

	startGame(client: Socket)
	{
		console.log("STARTGAME1");
		var room = roomMap.get(client.data.room);
		if (room != null)
		{
			console.log("STARTGAME2");
			if (room.key < 0)
				room.players[0].emit("assignNumber", 8);
			else
			{
				console.log("STARTGAME3");
				room.players[0].emit("assignNumber", 1);
				room.players[1].emit("assignNumber", 2);
				room.players[2].emit("assignNumber", 3);
				room.players[3].emit("assignNumber", 4);
			}
			
			setTimeout(() =>{{
				room.shurikenInterval = setInterval(this.updateShuriken, 15, room);
			}},4500);
	
			room.serverRef.in(room.name).emit("startSignal");
			room.hasStarted = true;
		}

	}

	findRoom(client: Socket): boolean
	{
		var stop = false;
		roomMap.forEach((roomObj, roomName) =>
		{
			if ((roomObj.hasStarted == false) && (stop == false)
			&& (client.data.key == roomObj.key) && (roomObj.numOfPlayers < 4))
			{
				// console.log(client.id, "joined room", roomName);
				roomObj.players[roomObj.numOfPlayers] = client;
				roomObj.numOfPlayers++;
				client.join(roomName);
				client.data.room = roomName;
				stop = true;
			}
		});
		return (stop);
	}

	createRoom(client: Socket)
	{
		roomMap.set("bossRoom"+numOfRooms, new Room);
		var room = roomMap.get("bossRoom"+numOfRooms);
		room.name = "bossRoom"+numOfRooms;
		room.serverRef = this.server;
		room.players[room.numOfPlayers] = client;
		room.numOfPlayers++;
		room.key = client.data.key;
		client.join(room.name);
		client.data.room = room.name;
		numOfRooms++;
	}


	handleDisconnect(client: Socket)
	{

	}

	// shuriken

	updateShuriken(room: Room)
	{
		room.moveShuriken();
		room.checkOutOfBounds();
		room.checkBossHit();
		room.serverRef.in(room.name).emit("updateShurikenPos", room.shurikenPos);
	}

	@SubscribeMessage('bouncePlayer')
	bouncePlayer(client: Socket, playerPos)
	{
		// console.log("bouncePlayer", args[0], args[1], args[2], args[3]);
		var room = roomMap.get(client.data.room);
		room.shurikenSpeed = bounce(room.shurikenSpeed, [playerPos[0], playerPos[1]], room.bossPos);
	}

	@SubscribeMessage('updatePlayers')
	updatePlayer(client: Socket, args)
	{
		client.in(client.data.room).emit("updatePlayerPos", args);
	}
}
