import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericRelation } from './generic-relation.entity';

@Entity()
export class ContentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appLabel: string;

  @Column()
  model: string;

  @Column()
  name: string;

  @OneToMany(() => GenericRelation, (relation) => relation.contentType)
  genericRelations: GenericRelation[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
