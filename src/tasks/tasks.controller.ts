import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import {
  UpdateTaskStatusDto,
  UpdateTaskAsegneeDto,
} from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { Logger } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');

  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.email}" retrieving all tasks. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('/:id')
  getTaskById(@Param('id') id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.email}" creating a new task. Data: ${JSON.stringify(
        createTaskDto,
      )}`,
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: number, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    return this.tasksService.updateTaskStatus(id, status);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch(':id')
  updateTask(
    @Param('id') id: number,
    @Body() updateTask: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, updateTask);
  }

  @Put('/:id/asignee')
  updateTaskAsignee(
    @Param('id') id: number,
    @Body() updateTaskAsigneeDto: UpdateTaskAsegneeDto,
  ): Promise<Task> {
    const { userId } = updateTaskAsigneeDto;
    return this.tasksService.asigneeTaskToUser(id, userId);
  }
}
