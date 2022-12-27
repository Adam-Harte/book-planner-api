import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { HeightMetric, WeightMetric } from './types/enums';

@Entity()
export class Creatures {
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
  height: number;

  @Column({
    name: 'height_metric',
    type: 'enum',
    enum: HeightMetric,
    nullable: true,
  })
  heightMetric: HeightMetric;

  @Column({
    type: 'float',
    nullable: true,
  })
  weight: number;

  @Column({
    name: 'weight_metric',
    type: 'enum',
    enum: WeightMetric,
    nullable: true,
  })
  weightMetric: WeightMetric;

  @Column({
    name: 'physical_description',
    type: 'varchar',
    nullable: true,
  })
  physicalDescription: string;

  @Column({
    name: 'personality_description',
    type: 'varchar',
    nullable: true,
  })
  personalityDescription: string;

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
