/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';
import { Characters } from './characters';

import { Series } from './series';
import { Settings } from './settings';
import { CommonWithImage } from './shared/commonWithImage';
import { GroupType } from './types/enums';

@Entity()
export class Groups extends CommonWithImage {
  @Column({
    type: 'enum',
    enum: GroupType,
    nullable: true,
  })
  type: GroupType;

  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.battles)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @ManyToMany(() => Characters)
  @JoinTable({
    name: 'groups_characters',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
  })
  characters: Relation<Characters>[];
}
