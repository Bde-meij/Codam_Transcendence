import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { Blocks } from './entities/block.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [TypeOrmModule.forFeature([Blocks]), AuthModule, UserModule],
	controllers: [BlockController],
	providers: [BlockService, JwtService],
	exports: [BlockService]
})
export class BlockModule {}
