import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Weapons extends CommonWithImage {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  creator: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  wielder: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  forged: string;
}
