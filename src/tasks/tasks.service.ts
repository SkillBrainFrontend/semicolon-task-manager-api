import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import { UsersRepository } from 'src/auth/users.repository';
import e from 'express';
import { use } from 'passport';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    @InjectRepository(UsersRepository)
    private tasksRepository: TasksRepository,
    private userRepository: UsersRepository,
  ) {}

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async getPersonalTaskById(id: number): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, assignedTo: user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.getPersonalTaskById(id);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }

  async asigneeTaskToUser(taskId: number, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    try {
      const userToAssignee = await this.userRepository.findOne({
        where: { id: userId },
        relations: [],
      });
      if (!userToAssignee) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      task.assignedTo = userToAssignee;
      task.status = TaskStatus.PENDING;
    } catch (e) {
      throw new NotFoundException(e.message);
    }

    // task.status = this.userRepository.findOne({ where: {} });
    await this.tasksRepository.save(task);

    return task;
  }
}
