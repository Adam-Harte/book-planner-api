import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PlotType } from './types/enums';

@Entity()
export class Plots {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: PlotType,
    nullable: true,
  })
  type: PlotType;

  @Column({
    type: 'int',
    nullable: true,
  })
  order: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
