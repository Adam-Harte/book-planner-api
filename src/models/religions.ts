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
  @ManyToOne(() => Series, (series) => series.religions)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.religions)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @OneToMany(() => Gods, (gods) => gods.religion)
  gods: Relation<Gods>[];

  @ManyToMany(() => Books, (books) => books.religions)
  books: Relation<Books>[];
}
