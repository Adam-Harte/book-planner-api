import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { PrimaryKeyId } from './primaryKeyId';

@Entity()
export class CreatedAndUpdated extends PrimaryKeyId {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
