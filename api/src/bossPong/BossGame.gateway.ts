import {OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit,SubscribeMessage,WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { NotAcceptableException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from "socket.io";
import {bounce, pointDiff} from "./vectorMath";
import { Room} from './Room';

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
		// console.log("server started");
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
			client.data.key = user.roomKey;
			await this.userService.updateStatus(client.data.userid, "in game");
			// console.log(client.data.key);
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
		if (client.data.key < 0)
		{
			this.createRoom(client);
			this.startGame(client);
		}
		else if (!this.findRoom(client))
			this.createRoom(client);
		else if (roomMap.get(client.data.room).numOfPlayers == 4)
			this.startGame(client);
	}

	@SubscribeMessage("startGameLoop")
	startGameLoop(client: Socket)
	{
		var room = roomMap.get(client.data.room);
		if ((room != null) && (room.hasStarted == false))
		{
			setTimeout(() =>{{
			room.shurikenInterval = setInterval(this.updateShuriken, 15, room)
			}}, 1500);
			room.hasStarted = true;
		}
	}

	@SubscribeMessage("resetBoss")
	resetBoss(client: Socket)
	{
		var room = roomMap.get(client.data.room);
		room.bossHit = false;
	}

	startGame(client: Socket)
	{
		var room = roomMap.get(client.data.room);
		if (room != null)
		{
			if (room.key < 0)
				room.players[0].emit("assignNumber", 8);
			else
			{
				room.players[0].emit("assignNumber", 1);
				room.players[1].emit("assignNumber", 2);
				room.players[2].emit("assignNumber", 3);
				room.players[3].emit("assignNumber", 4);
			}
			room.serverRef.in(room.name).emit("startSignal");
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
		// console.log("room", room.name, "created");
		numOfRooms++;
	}

	handleDisconnect(client: Socket)
	{
		setTimeout(async() =>{{
			const user = await this.userService.findUserById(client.data.userid);
			if (!user)
				return ;
			if (user.status !== "offline")
				await this.userService.updateStatus(client.data.userid, "online");
		}},500);
		var room = roomMap.get(client.data.room);
		if (room != null)
		{
			// if (room.hasStarted == true)
			room.serverRef.in(room.name).emit("abortGame");
			clearInterval(room.shurikenInterval);
			// console.log("deleting", room.name);
			roomMap.delete(room.name);
		}
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
		var room = roomMap.get(client.data.room);
		room.shurikenSpeed = bounce(room.shurikenSpeed, [playerPos[0], playerPos[1]], room.bossPos);
	}

	@SubscribeMessage('updatePlayers')
	updatePlayer(client: Socket, args)
	{
		if (!args.empty() && ((typeof(args[0]) === "number") && (typeof(args[1]) === "number") 
		&& (typeof(args[2]) === "number") && (typeof(args[3]) === "number")))
			client.in(client.data.room).emit("updatePlayerPos", args);
	}
}
