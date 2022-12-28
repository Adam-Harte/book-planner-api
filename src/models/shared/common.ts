import { Column, Entity } from 'typeorm';

import { CreatedAndUpdated } from './createdAndUpdated';

@Entity()
export class Common extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;
}
