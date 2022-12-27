import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Weapons {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  creator: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  wielder: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  forged: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
