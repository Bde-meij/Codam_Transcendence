import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { FriendStatus } from './entities/friend.entity';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}
	
	@Post('new-request/:target')
	@UseGuards(JwtGuard)
	async create(@Req() req, @Param('target') target: string) {
		const friendRequest: CreateFriendRequestDto = {
			sender: req.user.id,
			target:	target
		}
		return await this.friendsService.create(friendRequest);
	}
	
	@Delete('delete-request-id/:requestid')
	@UseGuards(JwtGuard)
	async deleteByRequestId(@Req() req, @Param('requestid') requestId: string) {
		return await this.friendsService.deleteByRequestId(req.user.id, requestId);
	}
	
	@Delete('delete-request-user/:targetuserid')
	@UseGuards(JwtGuard)
	async deleteByUserId(@Req() req, @Param('targetuserid') targetUserId: string) {
		return await this.friendsService.deleteByUserId(req.user.id, targetUserId);
	}
	
	@Post('accept-request/:id')
	@UseGuards(JwtGuard)
	async accept(@Req() req, @Param('id') requestId: string) {
		return await this.friendsService.updateStatus(req.user.id, requestId, FriendStatus.ACCEPTED);
	}

	@Post('decline-request/:id')
	@UseGuards(JwtGuard)
	async decline(@Req() req, @Param('id') requestId: string) {
		return await this.friendsService.updateStatus(req.user.id, requestId, FriendStatus.DECLINED);
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
	
	@Get('is-friends/:targetuserid')
	@UseGuards(JwtGuard)
	async isFriends(@Req() req, @Param('targetuserid') targetUserId: string) {
		return await this.friendsService.isFriendsUserId(req.user.id, targetUserId);
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
	
	@Delete('delete-request-user/:userid/:targetuserid')
	async deleteByUserId_NoCookie(@Req() req, @Param('targetuserid') targetUserId: string, @Param('userid') userId: string) {
		return await this.friendsService.deleteByUserId(userId, targetUserId);
	}
	
	@Post('accept-request/:userid/:id')
	async accept_NoCookie(@Req() req, @Param('id') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.updateStatus(userId, requestId, FriendStatus.ACCEPTED);
	}

	@Post('decline-request/:userid/:id')
	async decline_NoCookie(@Req() req, @Param('id') requestId: string, @Param('userid') userId: string) {
		return await this.friendsService.updateStatus(userId, requestId, FriendStatus.DECLINED);
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

	@Get('is-friends/:userid/:targetuserid')
	async isFriends_NoCookie(@Req() req, @Param('targetuserid') targetUserId: string, @Param('userid') userId: string) {
		return await this.friendsService.isFriendsUserId(userId, targetUserId);
	}
}