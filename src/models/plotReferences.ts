import { Column, Entity } from 'typeorm';

import { CreatedAndUpdated } from './shared/createdAndUpdated';
import { PlotReferenceTypes } from './types/enums';

@Entity({ name: 'plot_references' })
export class PlotReferences extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: PlotReferenceTypes,
    nullable: true,
  })
  type: PlotReferenceTypes;

  @Column({
    name: 'reference_id',
    type: 'int',
    unique: true,
  })
  referenceId: number;
}
