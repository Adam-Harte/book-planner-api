import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SettingType, SizeMetric } from './types/enums';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  size: number;

  @Column({
    name: 'size_metric',
    type: 'enum',
    enum: SizeMetric,
    nullable: true,
  })
  sizeMetric: SizeMetric;

  @Column({
    type: 'enum',
    enum: SettingType,
    nullable: true,
  })
  type: SettingType;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
