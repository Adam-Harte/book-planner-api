/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Relation,
} from 'typeorm';

import { Books } from './books';
import { Characters } from './characters';
import { PlotReferences } from './plotReferences';
import { Series } from './series';
import { Settings } from './settings';
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

  @ManyToMany(() => Characters)
  @JoinTable({
    name: 'plots_characters',
    joinColumn: {
      name: 'plot_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
  })
  characters: Relation<Characters>[];

  @ManyToMany(() => Settings)
  @JoinTable({
    name: 'plots_settings',
    joinColumn: {
      name: 'plot_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'setting_id',
      referencedColumnName: 'id',
    },
  })
  settings: Relation<Settings>[];

  @ManyToMany(() => PlotReferences, (plotReferences) => plotReferences.plots)
  @JoinTable({
    name: 'plots_plot_references',
    joinColumn: {
      name: 'plot_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'plot_reference_id',
      referencedColumnName: 'id',
    },
  })
  plotReferences: Relation<PlotReferences>[];
}
