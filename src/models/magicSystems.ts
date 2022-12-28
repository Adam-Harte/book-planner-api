import { Column, Entity } from 'typeorm';

import { Common } from './shared/common';

@Entity({ name: 'magic_systems' })
export class MagicSystems extends Common {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  rules: string;
}
