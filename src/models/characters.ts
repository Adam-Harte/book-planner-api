/* eslint-disable no-use-before-define */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  CharacterGender,
  CharacterTitle,
  CharacterType,
  HeightMetric,
  WeightMetric,
} from './types/enums';

@Entity()
export class Characters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 35,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 35,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: CharacterTitle,
    nullable: true,
  })
  title: CharacterTitle;

  @Column({
    type: 'enum',
    enum: CharacterType,
    nullable: true,
  })
  type: CharacterType;

  @Column({
    type: 'int',
    nullable: true,
  })
  age: number;

  @Column({
    type: 'enum',
    enum: CharacterGender,
    nullable: true,
  })
  gender: CharacterGender;

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
    name: 'character_arc',
    type: 'varchar',
    nullable: true,
  })
  characterArc: string;

  @ManyToOne(() => Characters, (characters) => characters.mothersChildren)
  @JoinColumn({ name: 'mother_id' })
  mother: Characters;

  @OneToMany(() => Characters, (characters) => characters.mother)
  mothersChildren: Characters[];

  @ManyToOne(() => Characters, (characters) => characters.fathersChildren)
  @JoinColumn({ name: 'father_id' })
  father: Characters;

  @OneToMany(() => Characters, (characters) => characters.father)
  fathersChildren: Characters[];

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
