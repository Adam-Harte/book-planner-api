import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';
import { GroupType } from './types/enums';

@Entity()
export class Groups extends CommonWithImage {
  @Column({
    type: 'enum',
    enum: GroupType,
    nullable: true,
  })
  type: GroupType;
}
