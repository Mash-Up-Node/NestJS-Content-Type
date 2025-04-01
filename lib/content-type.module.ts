import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTypeService } from './content-type.service';
import { getContentTypeMetadata } from './decorators/content-type.decorator';
import { ContentType } from './entities/content-type.entity';
import { GenericRelation } from './entities/generic-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentType, GenericRelation])],
  providers: [ContentTypeService],
  exports: [ContentTypeService],
})
export class ContentTypeModule implements OnModuleInit {
  constructor(private readonly contentTypeService: ContentTypeService) {}

  async onModuleInit() {
    const dataSource = this.contentTypeService.getDataSource();
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const metadata = getContentTypeMetadata(entity.target);
      if (!metadata) continue;

      const modelName = typeof entity.target === 'function' ? entity.target.name : entity.target;
      const appLabel = metadata.appLabel || modelName.toLowerCase();
      const contentType = await this.contentTypeService.getContentType(appLabel, modelName);

      this.contentTypeService.registerModel(`${contentType.appLabel}.${modelName}`, entity.target);
    }
  }
}
