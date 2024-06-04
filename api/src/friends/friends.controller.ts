import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Post('new-request/:target')
	// @UseGuards(JwtGuard)
	create(@Req() req, @Param('target') target: string) {
		const friendRequest: CreateFriendRequestDto = {
			// sender: req.user.id,
			sender: "89433",
			target:	target
		}
		return this.friendsService.create(friendRequest);
	}

	@Get()
	findAll() {
		return this.friendsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.friendsService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
		return this.friendsService.update(+id, updateFriendDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.friendsService.remove(+id);
	}
}
