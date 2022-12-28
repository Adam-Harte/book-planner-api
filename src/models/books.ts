/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { Plots } from './plots';
import { Series } from './series';
import { CreatedAndUpdated } from './shared/createdAndUpdated';
import { Genre } from './types/enums';
import { Users } from './users';
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

  @ManyToOne(() => Worlds, (worlds) => worlds.books)
  @JoinColumn({ name: 'world_id' })
  worlds: Relation<Worlds>;

  @OneToMany(() => Plots, (plots) => plots.book)
  plots: Relation<Plots>[];
}
