/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Settings } from './settings';
import { Being } from './shared/being';

@Entity()
export class Creatures extends Being {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @ManyToOne(() => Series, (series) => series.battles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.battles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Books, (books) => books.creatures, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
