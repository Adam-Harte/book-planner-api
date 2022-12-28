import { Column, Entity } from 'typeorm';

import { HeightMetric, WeightMetric } from '../types/enums';
import { CommonWithImage } from './commonWithImage';

@Entity()
export class Being extends CommonWithImage {
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
}
