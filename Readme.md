# Nest.js Content Type

![NPM Version](https://img.shields.io/npm/v/@mashup-node/content-type?style=for-the-badge)

[ContentType](https://docs.djangoproject.com/en/5.1/ref/contrib/contenttypes/) implementation in Nest.js + TypeORM with Minimal Changes in previous code base

**[ 이런 장점과 확장성이 있어요! ]**

- 기존 코드베이스의 큰 틀에 대한 수정은 필요 없어요
- 검색엔진과 연동하기 좋아요
  - 모델을 메타데이터 단위의 추적이 가능해요
  - 모델에 대한 검색 대상을 동적으로 결정할 수 있어요
- Event기반 기능 구현시 더욱 편리한 DX를 제공합니다.
- Permission 및 Object Permission을 구현할 수 있어요
- 일반 RDB Relation보다 훨씬 유연한 연관관계를 활용할 수 있어요

## Installation

```text
# npm

npm install @mashup-node/content-type

# yarn

yarn add @mashup-node/content-type

# pnpm

pnpm add @mashup-node/content-type

```

**[ Maintainers ]**

- [14th 윤준호(Hoplin)](https://github.com/J-Hoplin)

## How to use?

1. TypeORM Module Option 정의의 `entities` 프로퍼티에 아래 두 모델을 추가해주세요

```typescript
import { ContentType, GenericRelation } from '@mashup-node/content-type';

export const databaseSourceOption = {
  ...

  entities: [
    (Previous Entity Setting),
    ContentType,
    GenericRelation
  ],

  ...
};

```

2. ContentType에 등록하고 싶은 Entity에 `@EnrollContentType` 데코레이터를 추가합니다.

```typescript
import { EnrollContentType } from '@mashup-node/content-type';


@Entity('some_entity')
@EnrollContentType({ appLabel: 'application', name: 'SomeModel' })
export class SomeEntity extends BaseEntity {
  ...
}


@Entity('other_entity')
@EnrollContentType()
export class OtherEntity extends BaseEntity {
  ...
}
```

3. `ContentTypeModule`과 `ContentTypeService`를 활용해봐요.

`ContentTypeModule`은 TypeORM의 Entity Metadata를 활용하므로 TypeORM Module 이후에 호출되어야 한다는점은 필수에요. 자세한 API는 하단을 참조해주세요.

```typescript
// Module

@Module({
  imports: [TypeOrmModule.forRoot(databaseSourceOption), ... , ContentTypeModule],
})
export class AppModule {}

// Service

@Injectable()
export class AppService {
  constructor(
    private readonly config: ConfigService,
    private readonly puppeteer: PuppeteerPoolService,
    private readonly contentType: ContentTypeService,
  ) {}

  ...
}
```

## Decorator: `@EnrollContentType`

TypeORM Entity Class를 Content Type으로 등록한다. 사용방법은 일반 Entity에 대해 데코레이터를 추가합니다.

```typescript
import { Entity } from 'typeorm';

@Entity()
@EnrollContentType()
class SomeEntity {}
```

`@EnrollContentType`의 기본적인 Parameter Type입니다.

- `appLabel`: (Optional) 모델 앱 레이블, 모델 구분 식별자 역할
  - Default: Entity Name Lowercase
- `name`: (Optional) 모델 이름
  - Default: Entity Name

```typescript
export interface ContentTypeOptions {
  appLabel?: string;
  name?: string;
}
```

## APIs: `ContentTypeService`

### getContentType(appLabel: string, model: string): Promise<ContentType>

- **Description**: 주어진 app label과 entity name에 대한 ContentType을 가져오거나 생성합니다.
- **Parameter**:
  - `appLabel`: 구분자에 해당함
  - `model`: Entity 이름
- **Return**: Promise<ContentType>
- **Example**:
  ```typescript
  const contentType = await contentTypeService.getContentType('auth', 'User');
  ```

### getObject(contentType: ContentType, id: string | number): Promise<any>

- **Description**: ContentType과 ID를 통해 object를 가져옵니다.
- **Parameter**:
  - `contentType`: ContentType Instance
  - `id`: object's id. (내부적으로 처리할떄는 String으로만 처리함.)
- **Return**: Promise<any>
- **Example**:
  ```typescript
  const user = await contentTypeService.getObject(contentType, 1);
  ```

### createGenericRelation(contentType: ContentType, objectId: string | number, fieldName: string): Promise<GenericRelation>

- **Description**: 객체 간의 연관 관계를 생성합니다. (일반 RDB 연관관계보다 유연함)
- **Parameter**:
  - `contentType`: ContentType Instance
  - `objectId`: related object's id
  - `fieldName`: related field name
- **Return**: Promise<GenericRelation>
- **Example**:
  ```typescript
  const relation = await contentTypeService.createGenericRelation(contentType, 1, 'author');
  ```

### getGenericRelations(contentType: ContentType): Promise<GenericRelation[]>

- **Description**: ContentType에 대한 모든 연관 관계를 가져옵니다.
- **Parameter**:
  - `contentType`: ContentType Instance
- **Return**: Promise<GenericRelation[]>
- **Example**:
  ```typescript
  const relations = await contentTypeService.getGenericRelations(contentType);
  ```

### deleteGenericRelation(id: number): Promise<void>

- **Description**: GenericRelation 삭제합니다.
- **Parameter**:
  - `id`: relationId
- **Return**: Promise<void>
- **Example**:
  ```typescript
  await contentTypeService.deleteGenericRelation(1);
  ```

## License

MIT MashUp Node.js Team. See [LICENSE](./LICENSE) for more detail
