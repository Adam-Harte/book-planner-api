/* eslint-disable import/no-cycle */
import { Entity, ManyToMany, ManyToOne, OneToMany, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Worlds extends Common {
  @ManyToOne(() => Series, (series) => series.worlds, {
    onDelete: 'SET NULL',
  })
  series: Relation<Series>;

  @OneToMany(() => Settings, (settings) => settings.world, {
    onDelete: 'SET NULL',
  })
  settings: Relation<Settings>[];

  @ManyToMany(() => Books, (books) => books.worlds, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
