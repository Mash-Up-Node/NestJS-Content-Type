import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getContentTypeMetadata } from './decorators/content-type.decorator';
import { ContentType } from './entities/content-type.entity';
import { GenericRelation } from './entities/generic-relation.entity';

@Injectable()
export class ContentTypeService implements OnModuleInit {
  /**
   * Convention
   *
   * '{appLabel}.{modelName}'
   * TypeORM Reference: https://github.com/typeorm/typeorm/blob/master/src/data-source/DataSource.ts
   */
  private modelRegistry: Map<string, any> = new Map();

  constructor(
    @InjectRepository(ContentType)
    private contentTypeRepository: Repository<ContentType>,
    @InjectRepository(GenericRelation)
    private genericRelationRepository: Repository<GenericRelation>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const metadata = getContentTypeMetadata(entity.target);
      if (!metadata) continue;

      const modelName = typeof entity.target === 'function' ? entity.target.name : entity.target;
      const appLabel = metadata.appLabel || modelName.toLowerCase();
      const contentType = await this.getContentType(appLabel, modelName);

      this.modelRegistry.set(`${contentType.appLabel}.${modelName}`, entity.target);
    }
  }

  async getContentType(appLabel: string, model: string): Promise<ContentType> {
    let contentType = await this.contentTypeRepository.findOne({
      where: {
        appLabel,
        model,
      },
    });

    if (!contentType) {
      contentType = this.contentTypeRepository.create({
        appLabel,
        model,
        name: `${appLabel}.${model}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      contentType = await this.contentTypeRepository.save(contentType);
    }

    return contentType;
  }

  async getObject<T extends { id: string | number }>(
    contentType: ContentType,
    id: string | number,
  ): Promise<T | null> {
    /**
     * TypeORM의 Entity Metadata가 String인 혹시모를 경우 대비
     * 유즈케이스 확인 필요
     */
    const modelName = contentType.name.split('.').pop() || contentType.model;
    const modelClass = this.modelRegistry.get(`${contentType.appLabel}.${modelName}`);

    if (!modelClass) {
      throw new Error(`Model not found: ${contentType.appLabel}.${modelName}`);
    }

    const repository = this.dataSource.getRepository(modelClass);
    if (!repository) {
      throw new Error(`Repository not found for model: ${contentType.appLabel}.${modelName}`);
    }

    const result = await repository.findOne({ where: { id } });
    return result as T | null;
  }

  async createGenericRelation(
    contentType: ContentType,
    objectId: string | number,
    fieldName: string,
  ): Promise<GenericRelation> {
    const relation = this.genericRelationRepository.create({
      contentType,
      objectId: String(objectId),
      fieldName,
    });
    return await this.genericRelationRepository.save(relation);
  }

  async getGenericRelations(contentType: ContentType): Promise<GenericRelation[]> {
    return await this.genericRelationRepository.find({
      where: { contentType: { id: contentType.id } },
      relations: ['contentType'],
    });
  }

  async deleteGenericRelation(id: number): Promise<void> {
    await this.genericRelationRepository.delete(id);
  }
}
