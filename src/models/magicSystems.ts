/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Series } from './series';
import { Common } from './shared/common';

@Entity({ name: 'magic_systems' })
export class MagicSystems extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  rules: string;

  @ManyToOne(() => Series, (series) => series.magicSystems)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;
}
