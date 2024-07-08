import { HttpException, Injectable } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { DeleteBlockDto } from './dto/delete-block.dto';

@Injectable()
export class BlockService {
	constructor(@InjectRepository(Block) private readonly blockRepo: Repository<Block>, private readonly userService: UserService) {}

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
		// if (!user) {
		// 	// console.log('User not found! User id:', userId);
		// 	throw new HttpException('User not found', 404);
		// }
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
			// console.log('Cannot block yourself! User id:', createBlockDto.sender);
			throw new HttpException('Cannot block yourself', 400);
		}
		const sender: User = await this.userService.findUserById(createBlockDto.sender);
		// if (!sender) {
		// 	// console.log('Sender id not found! Sender id:', createBlockDto.sender);
		// 	throw new HttpException('Sender id not found', 404);
		// }
		const target: User = await this.userService.findUserById(createBlockDto.target);
		// if (!target) {
		// 	// console.log('Target id not found! Target id:', createBlockDto.target);
		// 	throw new HttpException('Target id not found', 404);
		// }
		if (await this.isBlocked(createBlockDto)) {
			// console.log('User already blocked!', createBlockDto.target);
			throw new HttpException('User already blocked', 400);
		}
		const block: Block = await this.blockRepo.save({
			sender: sender,
			target: target,
		});
		// console.log('Block created:\n', block);
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
			// console.log('Block not found!');
			throw new HttpException('Block not found', 404);
		}
		await this.blockRepo.delete({id: deleteBlockDto.target});
		// console.log('Block deleted:\n', block);
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
			// console.log('Block not found!');
			throw new HttpException('Block not found', 404);
		}
		await this.blockRepo.delete({id: block.id});
		// console.log('Block deleted:\n', block);
	}
}
