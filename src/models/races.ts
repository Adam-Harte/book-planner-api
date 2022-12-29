/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';
import { Books } from './books';
import { Characters } from './characters';
import { Languages } from './languages';

import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Races extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  traits: string;

  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.battles)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Characters, (characters) => characters.races, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'races_characters',
    joinColumn: {
      name: 'race_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
  })
  characters: Relation<Characters>[];

  @ManyToMany(() => Languages, (languages) => languages.races, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'races_languages',
    joinColumn: {
      name: 'race_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'language_id',
      referencedColumnName: 'id',
    },
  })
  languages: Relation<Languages>[];

  @ManyToMany(() => Books, (books) => books.races, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
