import { Column, Entity } from 'typeorm';

import { Common } from './shared/common';
import { PlotType } from './types/enums';

@Entity()
export class Plots extends Common {
  @Column({
    type: 'enum',
    enum: PlotType,
    nullable: true,
  })
  type: PlotType;

  @Column({
    type: 'int',
    nullable: true,
  })
  order: number;
}
