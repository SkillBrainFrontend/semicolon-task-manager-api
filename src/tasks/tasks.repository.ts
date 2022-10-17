import { User } from '../auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', true);

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const tasks = await this.createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .getMany();

    try {
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.email
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description, dueDate } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.UNNASIGNED,
      dueDate: new Date(dueDate),
      createdAt: new Date(),
      createdBy: user,
    });

    await this.save(task);
    return task;
  }
}
