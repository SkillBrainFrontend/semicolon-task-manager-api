import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class UpdateTaskAsegneeDto {
  @IsNotEmpty()
  userId: string;
}
