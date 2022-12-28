import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';

@Entity()
export class Artifacts extends CommonWithImage {
  @Column({
    type: 'int',
    nullable: true,
  })
  age: number;
}
