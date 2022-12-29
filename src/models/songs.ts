/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { CreatedAndUpdated } from './shared/createdAndUpdated';

@Entity()
export class Songs extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lyrics: string;

  @ManyToOne(() => Series, (series) => series.battles)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToMany(() => Books, (books) => books.songs, {
    onDelete: 'CASCADE',
  })
  books: Relation<Books>[];
}
