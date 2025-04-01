import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ContentTypeService } from '../lib/content-type.service';
import { EnrollContentType } from '../lib/decorators/content-type.decorator';
import { ContentType } from '../lib/entities/content-type.entity';
import { GenericRelation } from '../lib/entities/generic-relation.entity';

@EnrollContentType({ appLabel: 'test' })
class DefaultModel {
  id: number;
  name: string;
}

@EnrollContentType()
class DefaultLabeledModel {
  id: number;
  name: string;
}

describe('ContentTypeService', () => {
  let service: ContentTypeService;
  let contentTypeRepository: Repository<ContentType>;
  let genericRelationRepository: Repository<GenericRelation>;
  let dataSource: DataSource;

  const mockContentType: ContentType = {
    id: 1,
    appLabel: 'test',
    model: 'DefaultModel',
    name: 'test.DefaultModel',
    genericRelations: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockObject = {
    id: '1',
    name: 'Test Object',
  };

  const mockContentTypeRepository = {
    findOne: jest.fn().mockResolvedValue(mockContentType),
    create: jest.fn().mockReturnValue(mockContentType),
    save: jest.fn().mockResolvedValue(mockContentType),
  };

  const mockGenericRelationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    entityMetadatas: [{ target: DefaultModel }, { target: DefaultLabeledModel }],
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockObject),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentTypeService,
        {
          provide: getRepositoryToken(ContentType),
          useValue: mockContentTypeRepository,
        },
        {
          provide: getRepositoryToken(GenericRelation),
          useValue: mockGenericRelationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ContentTypeService>(ContentTypeService);
    contentTypeRepository = module.get<Repository<ContentType>>(getRepositoryToken(ContentType));
    genericRelationRepository = module.get<Repository<GenericRelation>>(
      getRepositoryToken(GenericRelation),
    );
    dataSource = module.get<DataSource>(DataSource);

    service.registerModel('test.DefaultModel', DefaultModel);
    service.registerModel('defaultlabeledmodel.DefaultLabeledModel', DefaultLabeledModel);
  });

  describe('Model Registration', () => {
    it('should register models on initialization', async () => {
      const result = await service.getObject(mockContentType, '1');
      expect(result).toEqual(mockObject);
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(DefaultModel);
    });
  });

  describe('getContentType', () => {
    it('should return existing content type', async () => {
      const result = await service.getContentType('test', 'DefaultModel');
      expect(result).toEqual(mockContentType);
      expect(mockContentTypeRepository.findOne).toHaveBeenCalledWith({
        where: { appLabel: 'test', model: 'DefaultModel' },
      });
    });

    it('should create new content type if not exists', async () => {
      mockContentTypeRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getContentType('test', 'DefaultModel');

      expect(result).toEqual(mockContentType);
      expect(mockContentTypeRepository.create).toHaveBeenCalled();
      expect(mockContentTypeRepository.save).toHaveBeenCalled();
    });
  });

  describe('getObject', () => {
    it('should return object by id', async () => {
      const result = await service.getObject(mockContentType, '1');
      expect(result).toEqual(mockObject);
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(DefaultModel);
    });

    it('should throw error if model not found', async () => {
      mockDataSource.getRepository.mockReturnValueOnce(null);
      await expect(service.getObject(mockContentType, '1')).rejects.toThrow();
    });
  });

  describe('Generic Relations', () => {
    const mockGenericRelation: GenericRelation = {
      id: 1,
      contentType: mockContentType,
      objectId: '1',
      fieldName: 'testField',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockGenericRelationRepository.create.mockReturnValue(mockGenericRelation);
      mockGenericRelationRepository.save.mockResolvedValue(mockGenericRelation);
      mockGenericRelationRepository.find.mockResolvedValue([mockGenericRelation]);
    });

    it('should create generic relation', async () => {
      const result = await service.createGenericRelation(mockContentType, '1', 'testField');
      expect(result).toEqual(mockGenericRelation);
      expect(mockGenericRelationRepository.create).toHaveBeenCalledWith({
        contentType: mockContentType,
        objectId: '1',
        fieldName: 'testField',
      });
    });

    it('should get generic relations', async () => {
      const result = await service.getGenericRelations(mockContentType);
      expect(result).toEqual([mockGenericRelation]);
      expect(mockGenericRelationRepository.find).toHaveBeenCalledWith({
        where: { contentType: { id: mockContentType.id } },
        relations: ['contentType'],
      });
    });

    it('should delete generic relation', async () => {
      await service.deleteGenericRelation(1);
      expect(mockGenericRelationRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
