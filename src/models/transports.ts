/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Settings } from './settings';
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Transports extends CommonWithImage {
  @ManyToOne(() => Series, (series) => series.transports)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.transports)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Books, (books) => books.transports)
  books: Relation<Books>[];
}
