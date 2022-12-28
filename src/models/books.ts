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
import { Histories } from './histories';
import { Languages } from './languages';
import { Legends } from './legends';
import { MagicSystems } from './magicSystems';
import { Maps } from './maps';
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

  @ManyToOne(() => Users, (users) => users.books)
  @JoinColumn({ name: 'user_id' })
  user: Relation<Users>;

  @ManyToOne(() => Series, (series) => series.books)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @OneToMany(() => Plots, (plots) => plots.book)
  plots: Relation<Plots>[];

  @ManyToMany(() => Characters, (characters) => characters.books)
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

  @ManyToMany(() => Settings, (settings) => settings.books)
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

  @ManyToMany(() => Worlds, (worlds) => worlds.books)
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

  @ManyToMany(() => MagicSystems, (magicSystems) => magicSystems.books)
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

  @ManyToMany(() => Weapons, (weapons) => weapons.books)
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

  @ManyToMany(() => Technologies, (technologies) => technologies.books)
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

  @ManyToMany(() => Transports, (transports) => transports.books)
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

  @ManyToMany(() => Battles, (battles) => battles.books)
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

  @ManyToMany(() => Creatures, (creatures) => creatures.books)
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

  @ManyToMany(() => Races, (races) => races.books)
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

  @ManyToMany(() => Languages, (languages) => languages.books)
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

  @ManyToMany(() => Songs, (songs) => songs.books)
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

  @ManyToMany(() => Families, (families) => families.books)
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

  @ManyToMany(() => Governments, (governments) => governments.books)
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

  @ManyToMany(() => Religions, (religions) => religions.books)
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

  @ManyToMany(() => Gods, (gods) => gods.books)
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

  @ManyToMany(() => Artifacts, (artifacts) => artifacts.books)
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

  @ManyToMany(() => Legends, (legends) => legends.books)
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

  @ManyToMany(() => Histories, (histories) => histories.books)
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

  @ManyToMany(() => Maps, (maps) => maps.books)
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
