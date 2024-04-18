import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>){}

  async validateUser(email: string, displayName: string) {
    const user = await this.userRepo.findOne({where: {email: email}});

    if (user) {
      return user;
    }

    const newUser = this.userRepo.create({email, displayName});
    await this.userRepo.save(newUser);
    return newUser;
  }

  async findUser(id: string) {
    const user = await this.userRepo.findOne({where: {id}});
    return id;
  }

  handlerLogin() {
    return 'handlerLogin';
  }

  handlerRedirect() {
    return 'handlerRedirect';
  }
}

  /*async findAll(): Promise<Auth[]> {
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
}*/
