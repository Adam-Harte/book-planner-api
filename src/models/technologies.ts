/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Series } from './series';
import { Settings } from './settings';
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Technologies extends CommonWithImage {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  inventor: string;

  @ManyToOne(() => Series, (series) => series.technologies)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.technologies)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;
}
