/* eslint-disable no-use-before-define */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Being } from './shared/being';
import { CharacterGender, CharacterTitle, CharacterType } from './types/enums';

@Entity()
export class Characters extends Being {
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
}
