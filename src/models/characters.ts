/* eslint-disable import/no-cycle */
/* eslint-disable no-use-before-define */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Families } from './families';
import { Groups } from './groups';
import { Plots } from './plots';
import { Races } from './races';
import { Series } from './series';
import { Settings } from './settings';
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
  mother: Relation<Characters>;

  @OneToMany(() => Characters, (characters) => characters.mother)
  mothersChildren: Relation<Characters>[];

  @ManyToOne(() => Characters, (characters) => characters.fathersChildren)
  @JoinColumn({ name: 'father_id' })
  father: Relation<Characters>;

  @OneToMany(() => Characters, (characters) => characters.father)
  fathersChildren: Relation<Characters>[];

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

  @ManyToOne(() => Series, (series) => series.characters)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.characters)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToOne(() => Families, (families) => families.characters)
  @JoinColumn({ name: 'family_id' })
  family: Relation<Families>;

  @ManyToMany(() => Books, (books) => books.characters, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];

  @ManyToMany(() => Plots, (plots) => plots.characters, {
    onDelete: 'CASCADE',
  })
  plots: Relation<Plots>[];

  @ManyToMany(() => Groups, (groups) => groups.characters, {
    onDelete: 'CASCADE',
  })
  groups: Relation<Groups>[];

  @ManyToMany(() => Races, (races) => races.characters, {
    onDelete: 'CASCADE',
  })
  races: Relation<Races>[];
}
