/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Characters } from './characters';
import { Series } from './series';
import { Settings } from './settings';
import { CommonWithImage } from './shared/commonWithImage';
import { FamilyType } from './types/enums';

@Entity()
export class Families extends CommonWithImage {
  @Column({
    type: 'enum',
    enum: FamilyType,
    nullable: true,
  })
  type: FamilyType;

  @Column({
    name: 'ally_ids',
    type: 'simple-array',
    nullable: true,
  })
  allyIds: number[];

  @Column({
    name: 'enemy_ids',
    type: 'simple-array',
    nullable: true,
  })
  enemyIds: number[];

  @ManyToOne(() => Series, (series) => series.families)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Settings, (settings) => settings.families)
  @JoinColumn({ name: 'setting_id' })
  setting: Relation<Settings>;

  @OneToMany(() => Characters, (characters) => characters.series)
  characters: Relation<Characters>[];

  @ManyToMany(() => Books, (books) => books.families)
  books: Relation<Books>[];
}
