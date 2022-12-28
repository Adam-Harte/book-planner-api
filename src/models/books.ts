import { Column, Entity } from 'typeorm';

import { CreatedAndUpdated } from './shared/createdAndUpdated';
import { Genre } from './types/enums';

@Entity()
export class Books extends CreatedAndUpdated {
  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: Genre,
    nullable: true,
  })
  genre: Genre;
}
