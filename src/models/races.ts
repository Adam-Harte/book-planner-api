/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Series } from './series';
import { Settings } from './settings';
import { Common } from './shared/common';

@Entity()
export class Races extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  traits: string;

  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.battles)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;
}
