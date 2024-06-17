import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { DeleteBlockDto } from './dto/delete-block.dto';

@Controller('block')
export class BlockController {
	constructor(private readonly blockService: BlockService) {}
	
	@Get('all-blocked')
	async getAllBlocked(@Req() req) {
		return await this.blockService.getAllBlocked(req.user.id);
	}

	@Get('is-blocked/:targetid')
	async isBlocked(@Req() req, @Param('targetid') targetId: string) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.isBlocked(block);
	}

	@Post('new-block/:targetid')
	async createBlock(@Req() req, @Param('targetid') targetId: string) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.createBlock(block);
	}
	
	@Delete('delete-block-id/:blockid')
	async deleteByBlockId(@Req() req, @Param('blockid') blockId: string) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: blockId,
		}
		return await this.blockService.deleteByBlockId(block);
	}
	
	@Delete('delete-block-user/:targetid')
	async deleteByUserId(@Req() req, @Param('targetid') targetId: string) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.deleteByUserId(block);
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
	
	@Get('all-blocked/:userid')
	async getAllBlocked_NoCookie(@Req() req, @Param('userid') userId: string) {
		return await this.blockService.getAllBlocked(userId);
	}

	@Get('is-blocked/:userid/:targetid')
	async isBlocked_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: CreateBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.isBlocked(block);
	}

	@Post('new-block/:userid/:targetid')
	async createBlock_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: CreateBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.createBlock(block);
	}
	
	@Delete('delete-block-id/:userid/:blockid')
	async deleteByBlockId_NoCookie(@Req() req, @Param('blockid') blockId: string, @Param('userid') userId: string) {
		const block: DeleteBlockDto = {
			sender: userId,
			target: blockId,
		}
		return await this.blockService.deleteByBlockId(block);
	}
	
	@Delete('delete-block-user/:userid/:targetid')
	async deleteByUserId_NoCookie(@Req() req, @Param('targetid') targetId: string, @Param('userid') userId: string) {
		const block: DeleteBlockDto = {
			sender: userId,
			target: targetId,
		}
		return await this.blockService.deleteByUserId(block);
	}
}
