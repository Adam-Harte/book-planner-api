/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Maps extends CommonWithImage {
  @ManyToOne(() => Series, (series) => series.maps, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToMany(() => Books, (books) => books.maps, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
