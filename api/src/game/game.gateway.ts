import { OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit,SubscribeMessage,WebSocketGateway,WebSocketServer } from '@nestjs/websockets';
import { NotAcceptableException, Req } from '@nestjs/common';
import { UpdateMatchDto } from './dto/update-match.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { MatchType } from "./entities/match.entity";
import { MatchService } from './match.service';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from "socket.io";
import { Room } from './Room';

var numOfRooms: number = 0;
var roomKey: number = 420;
var flappyKey: number = -1;
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

			client.emit("connectSignal");
		}
		catch
		{
			// console.log(client.id, "Game connection refused");
			client.disconnect();
			return;
		}
	}

	abortGame(room: Room)
	{
		if ((room.lScore == 0) && (room.rScore == 0))
		{
			if (room.hasStarted == true)
				this.matchService.deleteMatch(room.id);
			room.serverRef.in(room.name).emit("abortGame", "");
			return (1);
		}
		return (0);
	}

	declareWinner(room: Room, client: Socket)
	{
		var updateMatchDto: UpdateMatchDto =
		{
			id: room.id,
			leftPlayerScore: room.lScore,
			rightPlayerScore: room.rScore
		};
		if ((room.lScore != 11) && (room.rScore != 11))
		{
			if (client.id == room.leftPlayer.id) {
				updateMatchDto.leftPlayerScore = -1;
				room.rightPlayer.emit("playerwin", room.rightPlayer.data.nick);
			}
			if (client.id == room.rightPlayer.id) {
				updateMatchDto.rightPlayerScore = -1;
				room.leftPlayer.emit("playerwin", room.leftPlayer.data.nick);
			}
		}
		this.matchService.updateMatch(updateMatchDto);
	}

	handleDisconnect(client: Socket)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			if (room.hasStarted == true)
			{
				clearInterval(room.stopInterval);
				if (room.key < 0)
					clearInterval(room.gravityInterval);
			}
			if (!this.abortGame(room))
				this.declareWinner(room, client)
			roomMap.delete(room.name);
		}
		this.userService.updateRoomKey(client.data.userid, 0);
		setTimeout(async() =>{{
			const user = await this.userService.findUserById(client.data.userid);
			if (!user)
				return ;
			if (user.status !== "offline")
				await this.userService.updateStatus(client.data.userid, "online");
		}},500);
	}

	// INITIALIZATIONS
	@SubscribeMessage("joinGame")
	joinGame(client: Socket)
	{
		if (client.data.key < 1)
		{
			if (this.findRoom(client))
				this.startGame(roomMap.get(client.data.room));
			else
				this.createRoom(client);
		}
		else
			this.checkReservations(client);
	}

	checkReservations(client: Socket)
	{
		var room = roomMap.get("inviteRoom"+client.data.key)
		if (room == null)
			client.emit("abortGame", client.id);
		else if (room.leftPlayer == null)
		{
			room.leftPlayer = client;
			room.leftId = client.data.userid;
			room.serverRef = this.server;
			client.join(room.name);
			client.data.room = room.name;
		}
		else if (room.rightPlayer == null)
		{
			room.rightPlayer = client;
			room.rightId = client.data.userid;
			client.join(room.name);
			client.data.room = room.name;
			this.startGame(room);
		}
	}

	findRoom(client: Socket): boolean
	{
		// console.log(client.id, "called findRoom");
		var stop = false;
		roomMap.forEach((roomObj, roomName) =>
		{
			if ((roomObj.hasStarted == false) && (stop == false)
			&& (client.data.key == roomObj.key))
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
		room.key = client.data.key;
		client.join(room.name);
		client.data.room = room.name;
		numOfRooms++;
		// console.log("room", room.name, "created");
	}
	
	async startGame(room: Room)
	{
		if (room.leftId == room.rightId)
			this.abortGame(room);
		if ((((room.key < 0) != true) == false) == true)
		{
			room.leftPlayer.emit("assignNumber", 3);
			room.rightPlayer.emit("assignNumber", 4);
		}
		else 
		{
			room.leftPlayer.emit("assignNumber", 1);
			room.rightPlayer.emit("assignNumber", 2);
		}
		room.hasStarted = true;
		room.serverRef.in(room.name).emit("assignNames", 
		[room.leftPlayer.data.nick, room.rightPlayer.data.nick]);
		
		const match = await this.matchService.createMatch({
			leftPlayerId: room.leftId.toString(),
			rightPlayerId: room.rightId.toString(),
			type: MatchType.PUBLIC
		});
		room.id = match.id;

		if (room.key < 0)
		{
			setTimeout(() =>{{
				room.gravityInterval = setInterval(this.flappyGravity, 20, room);
			}},4500);
		}

		setTimeout(() =>{{
			room.stopInterval = setInterval(this.updateBall, 15, room);
		}},4500);
		room.serverRef.in(room.name).emit("startSignal");
	}

	@SubscribeMessage("updatePlayer")
	updatePlayer(client: Socket, yPos: number)
	{
		var room = roomMap.get(client.data.room)
		if (room != null)
		{
			if (client.id == room.leftPlayer.id)
				room.leftPos = yPos;
			if (client.id == room.rightPlayer.id)
				room.rightPos = yPos;
			room.checkCollision();
			client.in(room.name).emit("updatePlayerPos", yPos);
		}
	}

	flappyGravity(room: Room)
	{
		if (room.leftPos < 565)
			room.leftPos += 7.5;
		if (room.rightPos < 565)
			room.rightPos += 7.5;
		room.serverRef.in(room.name).emit("flappyGravity", [room.leftPos, room.rightPos]);
	}
	
	// BALLS
	updateBall(room: Room)
	{
		if (room != null)
		{
			room.moveBall();
			room.checkCollision();
			if (room.checkScoring())
				roomMap.delete(room.name);
			else
				room.serverRef.in(room.name).emit("updateBallPos", room.ballPos);
		}
	}
}

export function getNewRoomKey()
{
	roomKey++;
	roomMap.set("inviteRoom"+roomKey, new Room);
	var room = roomMap.get("inviteRoom"+roomKey);
	room.name = "inviteRoom"+roomKey;
	room.key = roomKey;
	return (roomKey);
}

export function getNewFlappyKey()
{
	flappyKey--;
	roomMap.set("inviteRoom"+flappyKey, new Room);
	var room = roomMap.get("inviteRoom"+flappyKey);
	room.name = "inviteRoom"+flappyKey;
	room.key = flappyKey;
	return (flappyKey);
}
