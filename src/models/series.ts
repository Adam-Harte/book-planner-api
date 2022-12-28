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

  @ManyToOne(() => Users, (users) => users.series)
  @JoinColumn({ name: 'user_id' })
  user: Relation<Users>;

  @OneToMany(() => Books, (books) => books.series)
  books: Relation<Books>[];

  @OneToMany(() => Settings, (settings) => settings.series)
  settings: Relation<Settings>[];

  @OneToMany(() => Worlds, (worlds) => worlds.series)
  worlds: Relation<Worlds>[];

  @OneToMany(() => Characters, (characters) => characters.series)
  characters: Relation<Characters>[];

  @OneToMany(() => Plots, (plots) => plots.series)
  plots: Relation<Plots>[];

  @OneToMany(() => PlotReferences, (plotReferences) => plotReferences.series)
  plotReferences: Relation<PlotReferences>[];

  @OneToMany(() => MagicSystems, (magicSystems) => magicSystems.series)
  magicSystems: Relation<MagicSystems>[];

  @OneToMany(() => Weapons, (weapons) => weapons.series)
  weapons: Relation<Weapons>[];

  @OneToMany(() => Technologies, (technologies) => technologies.series)
  technologies: Relation<Technologies>[];

  @OneToMany(() => Transports, (transports) => transports.series)
  transports: Relation<Transports>[];

  @OneToMany(() => Battles, (battles) => battles.series)
  battles: Relation<Battles>[];

  @OneToMany(() => Groups, (groups) => groups.series)
  groups: Relation<Groups>[];

  @OneToMany(() => Creatures, (creatures) => creatures.series)
  creatures: Relation<Creatures>[];

  @OneToMany(() => Races, (races) => races.series)
  races: Relation<Races>[];

  @OneToMany(() => Languages, (languages) => languages.series)
  languages: Relation<Languages>[];

  @OneToMany(() => Songs, (songs) => songs.series)
  songs: Relation<Songs>[];

  @OneToMany(() => Families, (families) => families.series)
  families: Relation<Families>[];

  @OneToMany(() => Governments, (governments) => governments.series)
  governments: Relation<Governments>[];

  @OneToMany(() => Religions, (religions) => religions.series)
  religions: Relation<Religions>[];

  @OneToMany(() => Gods, (gods) => gods.series)
  gods: Relation<Gods>[];

  @OneToMany(() => Artifacts, (artifacts) => artifacts.series)
  artifacts: Relation<Artifacts>[];

  @OneToMany(() => Legends, (legends) => legends.series)
  legends: Relation<Legends>[];

  @OneToMany(() => Histories, (histories) => histories.series)
  histories: Relation<Histories>[];

  @OneToMany(() => Maps, (maps) => maps.series)
  maps: Relation<Maps>[];
}
