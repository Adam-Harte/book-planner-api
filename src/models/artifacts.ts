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
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Artifacts extends CommonWithImage {
  @Column({
    type: 'int',
    nullable: true,
  })
  age: number;

  @ManyToOne(() => Series, (series) => series.artifacts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.artifacts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Books, (books) => books.artifacts, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
