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
import { Common } from './shared/common';

@Entity()
export class Battles extends Common {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  start: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  end: string;

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

  @ManyToMany(() => Books, (books) => books.battles, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
