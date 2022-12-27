import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PlotReferenceTypes } from './types/enums';

@Entity({ name: 'plot_references' })
export class PlotReferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: PlotReferenceTypes,
    nullable: true,
  })
  type: PlotReferenceTypes;

  @Column({
    name: 'reference_id',
    type: 'int',
    unique: true,
  })
  referenceId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
