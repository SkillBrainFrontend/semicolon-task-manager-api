import { Task } from '../tasks/task.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @OneToMany((_type) => Task, (task) => task.assignedTo, { eager: true })
  tasks: Task[];

  @OneToMany((_type) => Task, (task) => task.assignedTo, { eager: false })
  createdTasks: Task[];
}
