export const CONTENT_TYPE_METADATA = Symbol('CONTENT_TYPE_KEY');

export interface ContentTypeOptions {
  appLabel?: string;
  name?: string;
}

export function getContentTypeMetadata(target: any): ContentTypeOptions | undefined {
  return Reflect.getMetadata(CONTENT_TYPE_METADATA, target);
}

/**
 *
 * Decorator - @EnrollContentType
 *
 * Add CONTENT_TYPE_METADATA to the target entity
 * Add this decorator to entity for adding content type metadata
 * If options are not provided, appLabel will be generated from the model name
 */
export function EnrollContentType(options: ContentTypeOptions = {}) {
  return function (target: any) {
    const modelName = target.name;
    const defaultAppLabel = modelName.toLowerCase();
    const metadata: ContentTypeOptions = {
      appLabel: options.appLabel || defaultAppLabel,
      name: options.name || modelName,
    };

    Reflect.defineMetadata(CONTENT_TYPE_METADATA, metadata, target);
  };
}
