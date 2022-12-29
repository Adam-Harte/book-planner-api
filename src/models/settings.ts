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

import { Artifacts } from './artifacts';
import { Battles } from './battles';
import { Books } from './books';
import { Characters } from './characters';
import { Creatures } from './creatures';
import { Families } from './families';
import { Gods } from './gods';
import { Governments } from './governments';
import { Groups } from './groups';
import { Histories } from './histories';
import { Plots } from './plots';
import { Races } from './races';
import { Religions } from './religions';
import { Series } from './series';
import { CommonWithImage } from './shared/commonWithImage';
import { Technologies } from './technologies';
import { Transports } from './transports';
import { SettingType, SizeMetric } from './types/enums';
import { Worlds } from './worlds';

@Entity()
export class Settings extends CommonWithImage {
  @Column({
    type: 'float',
    nullable: true,
  })
  size: number;

  @Column({
    name: 'size_metric',
    type: 'enum',
    enum: SizeMetric,
    nullable: true,
  })
  sizeMetric: SizeMetric;

  @Column({
    type: 'enum',
    enum: SettingType,
    nullable: true,
  })
  type: SettingType;

  @ManyToOne(() => Series, (series) => series.settings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Worlds, (worlds) => worlds.settings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'world_id' })
  world: Relation<Worlds>;

  @OneToMany(() => Characters, (characters) => characters.setting, {
    onDelete: 'SET NULL',
  })
  characters: Relation<Characters>[];

  @OneToMany(() => Technologies, (technologies) => technologies.setting, {
    onDelete: 'SET NULL',
  })
  technologies: Relation<Technologies>[];

  @OneToMany(() => Transports, (transports) => transports.setting, {
    onDelete: 'SET NULL',
  })
  transports: Relation<Transports>[];

  @OneToMany(() => Battles, (battles) => battles.setting, {
    onDelete: 'SET NULL',
  })
  battles: Relation<Battles>[];

  @OneToMany(() => Groups, (groups) => groups.setting, {
    onDelete: 'SET NULL',
  })
  groups: Relation<Groups>[];

  @OneToMany(() => Creatures, (creatures) => creatures.setting, {
    onDelete: 'SET NULL',
  })
  creatures: Relation<Creatures>[];

  @OneToMany(() => Races, (races) => races.setting, {
    onDelete: 'SET NULL',
  })
  races: Relation<Races>[];

  @OneToMany(() => Families, (families) => families.setting, {
    onDelete: 'SET NULL',
  })
  families: Relation<Families>[];

  @OneToMany(() => Governments, (governments) => governments.setting, {
    onDelete: 'SET NULL',
  })
  governments: Relation<Governments>[];

  @OneToMany(() => Religions, (religions) => religions.setting, {
    onDelete: 'SET NULL',
  })
  religions: Relation<Religions>[];

  @OneToMany(() => Gods, (gods) => gods.setting, {
    onDelete: 'SET NULL',
  })
  gods: Relation<Gods>[];

  @OneToMany(() => Artifacts, (artifacts) => artifacts.setting, {
    onDelete: 'SET NULL',
  })
  artifacts: Relation<Artifacts>[];

  @OneToMany(() => Histories, (histories) => histories.setting, {
    onDelete: 'SET NULL',
  })
  histories: Relation<Histories>[];

  @ManyToMany(() => Books, (books) => books.settings, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];

  @ManyToMany(() => Plots, (plots) => plots.settings, {
    onDelete: 'CASCADE',
  })
  plots: Relation<Plots>[];
}
