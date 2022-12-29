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
export class Technologies extends CommonWithImage {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  inventor: string;

  @ManyToOne(() => Series, (series) => series.technologies, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.technologies, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Books, (books) => books.technologies, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
