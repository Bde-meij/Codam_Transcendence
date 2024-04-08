import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Auth) private authRepository: Repository<Auth>){}
  async create(createAuthDto: CreateAuthDto) : Promise<void> {
    await this.authRepository.save({...createAuthDto});
  }

  async findAll(): Promise<Auth[]> {
    return this.authRepository.find();
  }

  async findOne(id: number): Promise<Auth> {
    const auth = await this.authRepository.findOne({where: {id}});
    if (!auth)
    {
      throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
    }
    return auth;
  }

  async updatePass(id: number, updateAuthDto: UpdateAuthDto) {
    const auth = await this.authRepository.findOne({where: {id}});
    if (!auth)
    {
      throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
    }
    if (updateAuthDto.oldPassword !== auth.password)
    {
      throw new HttpException('Invalid credentials', 400);
    }
    await this.authRepository.update({id}, {password: updateAuthDto.password})
  }

  async remove(id: number) {
    await this.authRepository.delete({id});
  }
}
