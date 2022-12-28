import { Column, Entity } from 'typeorm';

import { Common } from './shared/common';

@Entity()
export class Battles extends Common {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  start: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  end: string;
}
