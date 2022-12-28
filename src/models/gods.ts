/* eslint-disable import/no-cycle */
import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Religions } from './religions';
import { Series } from './series';
import { Settings } from './settings';
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Gods extends CommonWithImage {
  @ManyToOne(() => Series, (series) => series.gods)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.gods)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToOne(() => Religions, (religions) => religions.gods)
  @JoinColumn({ name: 'religion_id' })
  religion: Relation<Religions>;
}
