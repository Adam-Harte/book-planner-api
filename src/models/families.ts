import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';
import { FamilyType } from './types/enums';

@Entity()
export class Families extends CommonWithImage {
  @Column({
    type: 'enum',
    enum: FamilyType,
    nullable: true,
  })
  type: FamilyType;

  @Column({
    name: 'ally_ids',
    type: 'simple-array',
    nullable: true,
  })
  allyIds: number[];

  @Column({
    name: 'enemy_ids',
    type: 'simple-array',
    nullable: true,
  })
  enemyIds: number[];
}
