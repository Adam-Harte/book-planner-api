/* eslint-disable import/no-cycle */
import {
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Gods } from './gods';
import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Religions extends Common {
  @ManyToOne(() => Series, (series) => series.religions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.religions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @OneToMany(() => Gods, (gods) => gods.religion, {
    onDelete: 'SET NULL',
  })
  gods: Relation<Gods>[];

  @ManyToMany(() => Books, (books) => books.religions, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
