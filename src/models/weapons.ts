/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Series } from './series';
import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Weapons extends CommonWithImage {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  creator: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  wielder: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  forged: string;

  @ManyToOne(() => Series, (series) => series.weapons)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;
}
