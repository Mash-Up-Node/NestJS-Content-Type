# Nest.js Content Type

Nest.js + TypeORM으로의 Content-Type 구현.
Django Content Type: https://docs.djangoproject.com/en/5.1/ref/contrib/contenttypes/

## Maintainer

- 14th 윤준호: https://github.com/J-Hoplin

## Decorator: `@EnrollContentType`

TypeORM Entity Class를 Content Type으로 등록한다. 사용방법은 일반 Entity에 대해 데코레이터를 추가한다.

```typescript
import { Entity } from 'typeorm';

@Entity()
@EnrollContentType()
class SomeEntity {}
```

`@EnrollContentType`의 기본적인 Parameter Type임.

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

### getObject(contentType: ContentType, id: number): Promise<any>

### createGenericRelation(contentType: ContentType, objectId: number, fieldName: string): Promise<GenericRelation>

### getGenericRelations(contentType: ContentType): Promise<GenericRelation[]>

### deleteGenericRelation(id:number): Promise<void>
