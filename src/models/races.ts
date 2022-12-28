import { Column, Entity } from 'typeorm';

import { Common } from './shared/common';

@Entity()
export class Races extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  traits: string;
}
