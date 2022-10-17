import { User } from '../auth/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @Column()
  createdAt: Date;

  @Column()
  dueDate: Date;

  @ManyToOne((_type) => User, (user) => user.tasks, { eager: false })
  assignedTo: User;

  @ManyToOne((_type) => User, (user) => user.createdTasks, { eager: false })
  createdBy: User;
}
