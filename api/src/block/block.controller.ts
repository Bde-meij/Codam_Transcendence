import { Controller, Get, Post, Param, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { DeleteBlockDto } from './dto/delete-block.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('block')
export class BlockController {
	constructor(private readonly blockService: BlockService) {}
	
	@Get('all-blocked')
	@UseGuards(JwtGuard)
	async getAllBlocked(@Req() req) {
		return await this.blockService.getAllBlocked(req.user.id);
	}

	@Get('is-blocked/:targetid')
	@UseGuards(JwtGuard)
	async isBlocked(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.isBlocked(block);
	}

	@Post('new-block/:targetid')
	@UseGuards(JwtGuard)
	async createBlock(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: CreateBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		return await this.blockService.createBlock(block);
	}
	
	@Delete('delete-block-id/:blockid')
	@UseGuards(JwtGuard)
	async deleteByBlockId(@Req() req, @Param('blockid', ParseIntPipe) blockId: number) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: blockId,
		}
		await this.blockService.deleteByBlockId(block);
	}
	
	@Delete('delete-block-user/:targetid')
	@UseGuards(JwtGuard)
	async deleteByUserId(@Req() req, @Param('targetid', ParseIntPipe) targetId: number) {
		const block: DeleteBlockDto = {
			sender: req.user.id,
			target: targetId,
		}
		await this.blockService.deleteByUserId(block);
	}
}
