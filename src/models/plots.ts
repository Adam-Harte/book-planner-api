/* eslint-disable import/no-cycle */
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Books } from './books';
import { Series } from './series';
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

  @ManyToOne(() => Series, (series) => series.plots)
  @JoinColumn({ name: 'series_id' })
  series: Relation<Series>;

  @ManyToOne(() => Books, (books) => books.plots)
  @JoinColumn({ name: 'book_id' })
  book: Relation<Books>;
}
