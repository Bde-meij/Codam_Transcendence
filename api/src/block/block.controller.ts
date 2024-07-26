import { Controller, Get, Post, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
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
	async isBlocked(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.isBlocked(block);
	}

	@Post('new-block/:targetid')
	async createBlock(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.createBlock(block);
	}
	
	@Delete('delete-block-id/:blockid')
	async deleteByBlockId(@Req() req, @Param('blockid', ParseIntPipe) blockId: number) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: blockId,
		}
		
		return await this.blockService.deleteByBlockId(block);
	}
	
	@Delete('delete-block-user/:targetid')
	async deleteByUserId(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.deleteByUserId(block);
	}
}
