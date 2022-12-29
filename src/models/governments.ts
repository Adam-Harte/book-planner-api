/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Governments extends Common {
  @ManyToOne(() => Series, (series) => series.governments)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.governments)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Books, (books) => books.governments, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
