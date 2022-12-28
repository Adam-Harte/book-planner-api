import { Column, Entity } from 'typeorm';

import { Common } from './shared/common';

@Entity()
export class Histories extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  events: string;
}
