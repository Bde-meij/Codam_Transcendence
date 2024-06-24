import { HttpException, Injectable } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { DeleteBlockDto } from './dto/delete-block.dto';
import { Loggary } from 'src/logger/logger.service';

@Injectable()
export class BlockService {
	constructor(@InjectRepository(Block) private readonly blockRepo: Repository<Block>, private readonly userService: UserService, private loggary: Loggary) {}

	async isBlocked(createBlockDto: CreateBlockDto): Promise<boolean> {
		const block: Block = await this.blockRepo.findOne({
			where: {
				sender: {id: createBlockDto.sender},
				target: {id: createBlockDto.target},
			}
		});
		if (!block) {
			return false;
		}
		return true;
	}

	async getAllBlocked(userId: string): Promise<Block[]> {
		const user: User = await this.userService.findUserById(userId);
		if (!user) {
			this.loggary.warn('User not found! User id:', userId);
			throw new HttpException('User not found', 404);
		}
		return await this.blockRepo.find({
			select: {
				id: true,
				createdAt: true,
				target: {
					id: true,
					nickname: true,
				}
			},
			where: {
				sender: {id: userId}
			},
			relations: {
				target: true
			}
		});
	}

	async createBlock(createBlockDto: CreateBlockDto): Promise<any> {
		if (createBlockDto.sender === createBlockDto.target) {
			this.loggary.warn('Cannot block yourself! User id:', createBlockDto.sender);
			throw new HttpException('Cannot block yourself', 400);
		}
		const sender: User = await this.userService.findUserById(createBlockDto.sender);
		if (!sender) {
			this.loggary.warn('Sender id not found! Sender id:', createBlockDto.sender);
			throw new HttpException('Sender id not found', 404);
		}
		const target: User = await this.userService.findUserById(createBlockDto.target);
		if (!target) {
			this.loggary.warn('Target id not found! Target id:', createBlockDto.target);
			throw new HttpException('Target id not found', 404);
		}
		if (await this.isBlocked(createBlockDto)) {
			this.loggary.warn('User already blocked!', createBlockDto.target);
			throw new HttpException('User already blocked', 400);
		}
		const block: Block = await this.blockRepo.save({
			sender: sender,
			target: target,
		});
		this.loggary.verbose('Block created:\n', block);
		return {
			id: block.id,
			createdAt: block.createdAt,
			sender: {
				id: block.sender.id,
				nickname: block.sender.nickname,
			},
			target: {
				id: block.target.id,
				nickname: block.target.nickname,
			},
		};
	}

	async deleteByBlockId(deleteBlockDto: DeleteBlockDto) {
		const block: Block = await this.blockRepo.findOne({
			where: {
				id: deleteBlockDto.target,
				sender: {
					id: deleteBlockDto.sender
				}
			}
		});
		if (!block) {
			this.loggary.warn('Block not found!');
			throw new HttpException('Block not found', 404);
		}
		await this.blockRepo.delete({id: deleteBlockDto.target});
		this.loggary.verbose('Block deleted:\n', block);
	}
	
	async deleteByUserId(deleteBlockDto: DeleteBlockDto) {
		const block: Block = await this.blockRepo.findOne({
			where: {
				sender: {
					id: deleteBlockDto.sender
				},
				target: {
					id: deleteBlockDto.target
				}
			}
		});
		if (!block) {
			this.loggary.warn('Block not found!');
			throw new HttpException('Block not found', 404);
		}
		await this.blockRepo.delete({id: block.id});
		this.loggary.verbose('Block deleted:\n', block);
	}
}
