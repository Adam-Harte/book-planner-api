import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PrimaryKeyId {
  @PrimaryGeneratedColumn()
  id: number;
}
