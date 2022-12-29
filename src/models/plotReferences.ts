/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Plots } from './plots';
import { Series } from './series';
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

  @ManyToOne(() => Series, (series) => series.plotReferences)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToMany(() => Plots, (plots) => plots.plotReferences, {
    onDelete: 'CASCADE',
  })
  plots: Relation<Plots>[];
}
