import { Column, Entity } from 'typeorm';

import { CommonWithImage } from './shared/commonWithImage';
import { SettingType, SizeMetric } from './types/enums';

@Entity()
export class Settings extends CommonWithImage {
  @Column({
    type: 'float',
    nullable: true,
  })
  size: number;

  @Column({
    name: 'size_metric',
    type: 'enum',
    enum: SizeMetric,
    nullable: true,
  })
  sizeMetric: SizeMetric;

  @Column({
    type: 'enum',
    enum: SettingType,
    nullable: true,
  })
  type: SettingType;
}
