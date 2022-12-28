import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Technology extends CommonWithImage {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  inventor: string;
}
