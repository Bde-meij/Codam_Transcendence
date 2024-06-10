import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FriendStatus } from './entities/friend.entity';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}
	
	@Post('new-request/:targetid')
	@UseGuards(JwtGuard)
	async create(@Req() req, @Param('targetid') targetId: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: req.user.id,
			target:	targetId
		}
		return await this.friendsService.create(friendRequest);
	}
	
	@Delete('delete-request-id/:requestid')
	@UseGuards(JwtGuard)
	async deleteByRequestId(@Req() req, @Param('requestid') requestId: string) {
		return await this.friendsService.deleteByRequestId(req.user.id, requestId);
	}
	
	@Delete('delete-request-user/:targetid')
	@UseGuards(JwtGuard)
	async deleteByUserId(@Req() req, @Param('targetid') targetId: string) {
		return await this.friendsService.deleteByUserId(req.user.id, targetId);
	}
	
	@Post('accept-request/:requestid')
	@UseGuards(JwtGuard)
	async accept(@Req() req, @Param('requestid') requestId: string) {
		return await this.friendsService.updateStatus(req.user.id, requestId, FriendStatus.ACCEPTED);
	}

	@Get('incoming')
	@UseGuards(JwtGuard)
	async findIncoming(@Req() req) {
		return await this.friendsService.findIncoming(req.user.id);
	}
	
	@Get('outgoing')
	@UseGuards(JwtGuard)
	async findOutgoing(@Req() req) {
		return await this.friendsService.findOutgoing(req.user.id);
	}
	
	@Get('all')
	@UseGuards(JwtGuard)
	async findFriends(@Req() req) {
		return await this.friendsService.findFriends(req.user.id);
	}
	
	@Get('is-friends/:targetid')
	@UseGuards(JwtGuard)
	async isFriends(@Req() req, @Param('targetid') targetId: string) {
		return await this.friendsService.isFriendsUserId(req.user.id, targetId);
	}
	
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// ---------------------------------TESTING FUNCTIONS WITHOUT USING JWT COOKIES---------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------

	@Post('new-request/:userid/:target')
	async create_NoCookie(@Req() req, @Param('target') target: string, @Param('userid') userId: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: userId,
			target:	target
		}
		return await this.friendsService.create(friendRequest);
	}
	
	@Delete('delete-request-id/:userid/:requestid')
	async deleteByRequestId_NoCookie(@Req() req, @Param('requestid') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.deleteByRequestId(userId, requestId);
	}
	
	@Delete('delete-request-user/:userid/:targetid')
	async deleteByUserId_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		return await this.friendsService.deleteByUserId(userId, targetId);
	}
	
	@Post('accept-request/:userid/:requestid')
	async accept_NoCookie(@Req() req, @Param('requestid') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.updateStatus(userId, requestId, FriendStatus.ACCEPTED);
	}

	@Get('incoming/:userid')
	async findIncoming_NoCookie(@Req() req, @Param('userid') userId: string) {
		return await this.friendsService.findIncoming(userId);
	}
	
	@Get('outgoing/:userid')
	async findOutgoing_NoCookie(@Req() req, @Param('userid') userId: string) {
		return await this.friendsService.findOutgoing(userId);
	}

	@Get('all/:userid')
	async findFriends_NoCookie(@Req() req, @Param('userid') userId: string) {
		return await this.friendsService.findFriends(userId);
	}

	@Get('is-friends/:userid/:targetid')
	async isFriends_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		return await this.friendsService.isFriendsUserId(userId, targetId);
	}
}