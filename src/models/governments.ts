/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

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
}
