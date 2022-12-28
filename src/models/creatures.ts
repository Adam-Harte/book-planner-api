/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Series } from './series';
import { Settings } from './settings';
import { Being } from './shared/being';

@Entity()
export class Creatures extends Being {
  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.battles)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;
}
