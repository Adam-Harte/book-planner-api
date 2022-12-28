import { Column, Entity } from 'typeorm';

import { Common } from './common';

@Entity()
export class CommonWithImage extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  image: string;
}
