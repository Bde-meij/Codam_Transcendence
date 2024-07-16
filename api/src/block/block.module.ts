import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { Block } from './entities/block.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Block]), AuthModule, UserModule],
	controllers: [BlockController],
	providers: [BlockService],
	exports: [BlockService]
})
export class BlockModule {}
