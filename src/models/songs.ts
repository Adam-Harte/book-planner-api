import { Column, Entity } from 'typeorm';

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
}
