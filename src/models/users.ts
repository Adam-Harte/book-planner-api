import { Column, Entity } from 'typeorm';

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
    length: 20,
  })
  password: string;
}
