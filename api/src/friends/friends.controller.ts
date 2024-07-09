import { Controller, Get, Post, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FriendStatus } from './entities/friend.entity';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}
	
	///✅ send new friend request with friend nickname
	@Post('new-request-nick/:targetnick')
	@UseGuards(JwtGuard)
	async createNick(@Req() req, @Param('targetnick') targetNick: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: req.user.id,
			target:	targetNick
		}
		return await this.friendsService.createNick(friendRequest);
	}

	// send new friend request with friend id
	@Post('new-request/:targetid')
	@UseGuards(JwtGuard)
	async create(@Req() req, @Param('targetid') targetId: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: req.user.id,
			target:	targetId
		}
		return await this.friendsService.create(friendRequest);
	}
	
	///✅ delete friend request (accepted or not) with the friend request id
	@Delete('delete-request-id/:requestid')
	@UseGuards(JwtGuard)
	async deleteByRequestId(@Req() req, @Param('requestid') requestId: string) {
		return await this.friendsService.deleteByRequestId(req.user.id, requestId);
	}
	
	///✅ delete friend request (accepted or not) with the target user id
	@Delete('delete-request-user/:targetid')
	@UseGuards(JwtGuard)
	async deleteByUserId(@Req() req, @Param('targetid') targetId: string) {
		return await this.friendsService.deleteByUserId(req.user.id, targetId);
	}
	
	///✅ accept friend request with the friend request id
	@Post('accept-request/:requestid')
	@UseGuards(JwtGuard)
	async accept(@Req() req, @Param('requestid') requestId: string) {
		return await this.friendsService.updateStatus(req.user.id, requestId, FriendStatus.ACCEPTED);
	}

	///✅ list with all incoming requests
	@Get('incoming')
	@UseGuards(JwtGuard)
	async findIncoming(@Req() req) {
		return await this.friendsService.findIncoming(req.user.id);
	}
	
	///✅ list with all outgoing requests
	@Get('outgoing')
	@UseGuards(JwtGuard)
	async findOutgoing(@Req() req) {
		return await this.friendsService.findOutgoing(req.user.id);
	}
	
	//✅ list with all your friends
	@Get('all')
	@UseGuards(JwtGuard)
	async findFriends(@Req() req) {
		return await this.friendsService.findFriends(req.user.id);
	}
	
	// check if this is friend
	@Get('is-friends/:targetid')
	@UseGuards(JwtGuard)
	async isFriends(@Req() req, @Param('targetid') targetId: string) {
		return await this.friendsService.isFriendsUserId(req.user.id, targetId);
	}

	// THESE ENDPOINTS HAVE BEEN MOVED TO THE TESTING CONTROLLER
	// TO ACCESS THEM, PUT 'testing/' INTO THE URL. example:
	// http://localhost:4200/api/friends/new-request/1/2
	// is now
	// http://localhost:4200/api/testing/friends/new-request/1/2
	//
	// Feel free to delete the endpoints below once you've switched over your testing requests

	@Post('new-request/:userid/:target')
	async create_NoCookie(@Req() req, @Param('target') target: string, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/new-request/:userid/:target', HttpStatus.BAD_REQUEST);
	}
	
	@Delete('delete-request-id/:userid/:requestid')
	async deleteByRequestId_NoCookie(@Req() req, @Param('requestid') requestId: string, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/delete-request-id/:userid/:requestid', HttpStatus.BAD_REQUEST);
	}
	
	@Delete('delete-request-user/:userid/:targetid')
	async deleteByUserId_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/delete-request-user/:userid/:targetid', HttpStatus.BAD_REQUEST);
	}
	
	@Post('accept-request/:userid/:requestid')
	async accept_NoCookie(@Req() req, @Param('requestid') requestId: string, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/accept-request/:userid/:requestid', HttpStatus.BAD_REQUEST);
	}

	@Get('incoming/:userid')
	async findIncoming_NoCookie(@Req() req, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/incoming/:userid', HttpStatus.BAD_REQUEST);
	}
	
	@Get('outgoing/:userid')
	async findOutgoing_NoCookie(@Req() req, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/outgoing/:userid', HttpStatus.BAD_REQUEST);
	}

	@Get('all/:userid')
	async findFriends_NoCookie(@Req() req, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/all/:userid', HttpStatus.BAD_REQUEST);
	}

	@Get('is-friends/:userid/:targetid')
	async isFriends_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		throw new HttpException('Endpoint has moved to: https://localhost:4200/api/testing/is-friends/:userid/:targetid', HttpStatus.BAD_REQUEST);
	}
}