/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
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
import { Languages } from './languages';
import { Legends } from './legends';
import { MagicSystems } from './magicSystems';
import { Maps } from './maps';
import { PlotReferences } from './plotReferences';
import { Plots } from './plots';
import { Races } from './races';
import { Religions } from './religions';
import { Settings } from './settings';
import { CreatedAndUpdated } from './shared/createdAndUpdated';
import { Songs } from './songs';
import { Technologies } from './technologies';
import { Transports } from './transports';
import { Genre } from './types/enums';
import { Users } from './users';
import { Weapons } from './weapons';
import { Worlds } from './worlds';

@Entity()
export class Series extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: Genre,
    nullable: true,
  })
  genre: Genre;

  @ManyToOne(() => Users, (users) => users.series, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<Users>;

  @OneToMany(() => Books, (books) => books.series, {
    onDelete: 'SET NULL',
  })
  books: Relation<Books>[];

  @OneToMany(() => Settings, (settings) => settings.series, {
    onDelete: 'SET NULL',
  })
  settings: Relation<Settings>[];

  @OneToMany(() => Worlds, (worlds) => worlds.series, {
    onDelete: 'SET NULL',
  })
  worlds: Relation<Worlds>[];

  @OneToMany(() => Characters, (characters) => characters.series, {
    onDelete: 'SET NULL',
  })
  characters: Relation<Characters>[];

  @OneToMany(() => Plots, (plots) => plots.series, {
    onDelete: 'SET NULL',
  })
  plots: Relation<Plots>[];

  @OneToMany(() => PlotReferences, (plotReferences) => plotReferences.series, {
    onDelete: 'SET NULL',
  })
  plotReferences: Relation<PlotReferences>[];

  @OneToMany(() => MagicSystems, (magicSystems) => magicSystems.series, {
    onDelete: 'SET NULL',
  })
  magicSystems: Relation<MagicSystems>[];

  @OneToMany(() => Weapons, (weapons) => weapons.series, {
    onDelete: 'SET NULL',
  })
  weapons: Relation<Weapons>[];

  @OneToMany(() => Technologies, (technologies) => technologies.series, {
    onDelete: 'SET NULL',
  })
  technologies: Relation<Technologies>[];

  @OneToMany(() => Transports, (transports) => transports.series, {
    onDelete: 'SET NULL',
  })
  transports: Relation<Transports>[];

  @OneToMany(() => Battles, (battles) => battles.series, {
    onDelete: 'SET NULL',
  })
  battles: Relation<Battles>[];

  @OneToMany(() => Groups, (groups) => groups.series, {
    onDelete: 'SET NULL',
  })
  groups: Relation<Groups>[];

  @OneToMany(() => Creatures, (creatures) => creatures.series, {
    onDelete: 'SET NULL',
  })
  creatures: Relation<Creatures>[];

  @OneToMany(() => Races, (races) => races.series, {
    onDelete: 'SET NULL',
  })
  races: Relation<Races>[];

  @OneToMany(() => Languages, (languages) => languages.series, {
    onDelete: 'SET NULL',
  })
  languages: Relation<Languages>[];

  @OneToMany(() => Songs, (songs) => songs.series, {
    onDelete: 'SET NULL',
  })
  songs: Relation<Songs>[];

  @OneToMany(() => Families, (families) => families.series, {
    onDelete: 'SET NULL',
  })
  families: Relation<Families>[];

  @OneToMany(() => Governments, (governments) => governments.series, {
    onDelete: 'SET NULL',
  })
  governments: Relation<Governments>[];

  @OneToMany(() => Religions, (religions) => religions.series, {
    onDelete: 'SET NULL',
  })
  religions: Relation<Religions>[];

  @OneToMany(() => Gods, (gods) => gods.series, {
    onDelete: 'SET NULL',
  })
  gods: Relation<Gods>[];

  @OneToMany(() => Artifacts, (artifacts) => artifacts.series, {
    onDelete: 'SET NULL',
  })
  artifacts: Relation<Artifacts>[];

  @OneToMany(() => Legends, (legends) => legends.series, {
    onDelete: 'SET NULL',
  })
  legends: Relation<Legends>[];

  @OneToMany(() => Histories, (histories) => histories.series, {
    onDelete: 'SET NULL',
  })
  histories: Relation<Histories>[];

  @OneToMany(() => Maps, (maps) => maps.series, {
    onDelete: 'SET NULL',
  })
  maps: Relation<Maps>[];
}
