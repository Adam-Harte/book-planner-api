/* eslint-disable import/no-cycle */
import { Entity, ManyToMany, ManyToOne, OneToMany, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Worlds extends Common {
  @ManyToOne(() => Series, (series) => series.worlds)
  series: Relation<Series>;

  @OneToMany(() => Settings, (settings) => settings.world)
  settings: Relation<Settings>[];

  @ManyToMany(() => Books, (books) => books.worlds)
  books: Relation<Books>[];
}
