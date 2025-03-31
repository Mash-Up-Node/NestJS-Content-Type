import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTypeService } from './content-type.service';
import { ContentType } from './entities/content-type.entity';
import { GenericRelation } from './entities/generic-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentType, GenericRelation])],
  providers: [ContentTypeService],
  exports: [ContentTypeService],
})
export class ContentTypeModule {}
