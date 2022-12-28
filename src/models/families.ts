import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FamilyType } from './types/enums';

@Entity()
export class Families {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: FamilyType,
    nullable: true,
  })
  type: FamilyType;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'ally_ids',
    type: 'simple-array',
    nullable: true,
  })
  allyIds: number[];

  @Column({
    name: 'enemy_ids',
    type: 'simple-array',
    nullable: true,
  })
  enemyIds: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
