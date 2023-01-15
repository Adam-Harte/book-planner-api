/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { Artifacts } from './artifacts';
import { Battles } from './battles';
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
import { Series } from './series';
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
export class Books extends CreatedAndUpdated {
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

  @ManyToOne(() => Users, (users) => users.books, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<Users>;

  @ManyToOne(() => Series, (series) => series.books, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @OneToMany(() => Plots, (plots) => plots.book, {
    onDelete: 'SET NULL',
  })
  plots: Relation<Plots>[];

  @OneToMany(() => PlotReferences, (plotReferences) => plotReferences.book, {
    onDelete: 'SET NULL',
  })
  plotReferences: Relation<PlotReferences>[];

  @ManyToMany(() => Characters, (characters) => characters.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_characters',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
  })
  characters: Relation<Characters>[];

  @ManyToMany(() => Settings, (settings) => settings.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_settings',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'setting_id',
      referencedColumnName: 'id',
    },
  })
  settings: Relation<Settings>[];

  @ManyToMany(() => Worlds, (worlds) => worlds.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_worlds',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'world_id',
      referencedColumnName: 'id',
    },
  })
  worlds: Relation<Worlds>[];

  @ManyToMany(() => MagicSystems, (magicSystems) => magicSystems.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_magic_systems',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'magic_system_id',
      referencedColumnName: 'id',
    },
  })
  magicSystems: Relation<MagicSystems>[];

  @ManyToMany(() => Weapons, (weapons) => weapons.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_weapons',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'weapon_id',
      referencedColumnName: 'id',
    },
  })
  weapons: Relation<Weapons>[];

  @ManyToMany(() => Technologies, (technologies) => technologies.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_technologies',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'technology_id',
      referencedColumnName: 'id',
    },
  })
  technologies: Relation<Technologies>[];

  @ManyToMany(() => Transports, (transports) => transports.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_transports',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'transport_id',
      referencedColumnName: 'id',
    },
  })
  transports: Relation<Transports>[];

  @ManyToMany(() => Battles, (battles) => battles.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_battles',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'battle_id',
      referencedColumnName: 'id',
    },
  })
  battles: Relation<Battles>[];

  @ManyToMany(() => Groups, (groups) => groups.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_groups',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
  })
  groups: Relation<Groups>[];

  @ManyToMany(() => Creatures, (creatures) => creatures.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_creatures',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'creature_id',
      referencedColumnName: 'id',
    },
  })
  creatures: Relation<Creatures>[];

  @ManyToMany(() => Races, (races) => races.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_races',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'race_id',
      referencedColumnName: 'id',
    },
  })
  races: Relation<Races>[];

  @ManyToMany(() => Languages, (languages) => languages.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_languages',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'language_id',
      referencedColumnName: 'id',
    },
  })
  languages: Relation<Languages>[];

  @ManyToMany(() => Songs, (songs) => songs.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_songs',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'song_id',
      referencedColumnName: 'id',
    },
  })
  songs: Relation<Songs>[];

  @ManyToMany(() => Families, (families) => families.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_families',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'family_id',
      referencedColumnName: 'id',
    },
  })
  families: Relation<Families>[];

  @ManyToMany(() => Governments, (governments) => governments.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_governments',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'government_id',
      referencedColumnName: 'id',
    },
  })
  governments: Relation<Governments>[];

  @ManyToMany(() => Religions, (religions) => religions.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_religions',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'religion_id',
      referencedColumnName: 'id',
    },
  })
  religions: Relation<Religions>[];

  @ManyToMany(() => Gods, (gods) => gods.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_gods',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'god_id',
      referencedColumnName: 'id',
    },
  })
  gods: Relation<Gods>[];

  @ManyToMany(() => Artifacts, (artifacts) => artifacts.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_artifacts',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artifact_id',
      referencedColumnName: 'id',
    },
  })
  artifacts: Relation<Artifacts>[];

  @ManyToMany(() => Legends, (legends) => legends.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_legends',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'legend_id',
      referencedColumnName: 'id',
    },
  })
  legends: Relation<Legends>[];

  @ManyToMany(() => Histories, (histories) => histories.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_histories',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'history_id',
      referencedColumnName: 'id',
    },
  })
  histories: Relation<Histories>[];

  @ManyToMany(() => Maps, (maps) => maps.books, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'books_maps',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'map_id',
      referencedColumnName: 'id',
    },
  })
  maps: Relation<Maps>[];
}
