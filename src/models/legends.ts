/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Common } from './shared/common';

@Entity()
export class Legends extends Common {
  @ManyToOne(() => Series, (series) => series.legends, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToMany(() => Books, (books) => books.legends, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
