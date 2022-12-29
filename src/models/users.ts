/* eslint-disable import/no-cycle */
import { Column, Entity, OneToMany, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
import { CreatedAndUpdated } from './shared/createdAndUpdated';

@Entity()
export class Users extends CreatedAndUpdated {
  @Column({
    unique: true,
    type: 'varchar',
    length: 35,
  })
  username: string;

  @Column({
    unique: true,
    type: 'varchar',
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  password: string;

  @OneToMany(() => Series, (series) => series.user, {
    onDelete: 'SET NULL',
  })
  series: Relation<Series>[];

  @OneToMany(() => Books, (books) => books.user, {
    onDelete: 'SET NULL',
  })
  books: Relation<Books>[];
}
