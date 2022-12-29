/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Races } from './races';
import { Series } from './series';
import { Common } from './shared/common';

@Entity()
export class Languages extends Common {
  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToMany(() => Books, (books) => books.languages, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];

  @ManyToMany(() => Races, (races) => races.languages, {
    onDelete: 'CASCADE',
  })
  races: Relation<Races>[];
}
