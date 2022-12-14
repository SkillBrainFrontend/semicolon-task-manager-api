import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.usersRepository.getUsers();
  }

  async getLoggedUser(user: User): Promise<User> {
    const loggedUser = await this.usersRepository.findOne(user.id);
    if (!loggedUser) {
      throw new UnauthorizedException(`User is not logged in`);
    }
    return loggedUser;
  }

  async updateUser(user: User, userDto: UpdateUserDto): Promise<User> {
    const loggedUser = await this.usersRepository.findOne(user.id);
    if (!loggedUser) {
      throw new UnauthorizedException(`User is not logged in`);
    }
    const updatedUser = {
      ...loggedUser,
      ...userDto,
    };

    return await this.usersRepository.save(updatedUser);
  }

  async getUserById(id: string): Promise<User> {
    try {
      const found = await this.usersRepository
        .createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.tasks', 'tasks')
        .leftJoinAndSelect('tasks.createdBy', 'createdBy')
        .getOne();

      if (!found) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      return found;
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  async uploadProfilePicture(user: User, filename: string): Promise<User> {
    try {
      const updatedUser = await this.usersRepository.findOne({
        where: { id: user.id },
      });
      updatedUser.profilePicture = filename;
      return await this.usersRepository.save(updatedUser);
    } catch (e) {
      return e.message;
    }
  }
}
