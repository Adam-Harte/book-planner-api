/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Plots } from './plots';
import { Series } from './series';
import { CreatedAndUpdated } from './shared/createdAndUpdated';
import { PlotReferenceType } from './types/enums';

@Entity({ name: 'plot_references' })
export class PlotReferences extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: PlotReferenceType,
    nullable: true,
  })
  type: PlotReferenceType;

  @Column({
    name: 'reference_id',
    type: 'int',
  })
  referenceId: number;

  @ManyToOne(() => Series, (series) => series.plotReferences, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Books, (books) => books.plotReferences, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'book_id' })
  book: Relation<Books>;

  @ManyToMany(() => Plots, (plots) => plots.plotReferences, {
    onDelete: 'CASCADE',
  })
  plots: Relation<Plots>[];
}
