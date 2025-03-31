import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentType } from './content-type.entity';

@Entity()
export class GenericRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContentType, (contentType) => contentType.genericRelations)
  @JoinColumn()
  contentType: ContentType;

  @Column()
  objectId: string;

  @Column()
  fieldName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
