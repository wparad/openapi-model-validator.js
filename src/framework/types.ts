import { Options as AjvOptions } from 'ajv';
export { OpenAPIFrameworkArgs };

export type BodySchema =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3.SchemaObject
  | {};

export interface ParametersSchema {
  query: object;
  headers: object;
  path: object;
  cookies: object;
}

export interface ValidationSchema extends ParametersSchema {
  body: BodySchema;
}

export interface Options extends AjvOptions {
  // Specific options
  serDesMap?: SerDesMap;
}

export interface RequestValidatorOptions extends Options, ValidateRequestOpts {}

export type ValidateRequestOpts = {
  allowUnknownQueryParameters?: boolean;
  removeAdditional?: boolean | 'all' | 'failing';
};

export type Format = {
  name: string;
  type?: 'number' | 'string';
  validate: (v: any) => boolean;
};

export type SerDes = {
  format: string;
  serialize?: (o: unknown) => string;
  deserialize?: (s: string) => unknown;
};

export class SerDesSingleton implements SerDes {
  serializer: SerDes;
  deserializer: SerDes;
  format: string;
  serialize?: (o: unknown) => string;
  deserialize?: (s: string) => unknown;

  constructor(param: {
    format: string;
    serialize: (o: unknown) => string;
    deserialize: (s: string) => unknown;
  }) {
    this.format = param.format;
    this.serialize = param.serialize;
    this.deserialize = param.deserialize;
    this.deserializer = {
      format : param.format,
      deserialize : param.deserialize
    }
    this.serializer = {
      format : param.format,
      serialize : param.serialize
    }
  }
};

export type SerDesMap = {
  [format: string]: SerDes
};

export interface OpenApiValidatorOpts {
  apiSpec: OpenAPIV3.Document | string;
  validateApiSpec?: boolean;
  validateRequests?: boolean | ValidateRequestOpts;
  serDes?: SerDes[];
  formats?: Format[];
}

export namespace OpenAPIV3 {
  export interface Document {
    openapi: string;
    info: InfoObject;
    servers?: ServerObject[];
    paths: PathsObject;
    components?: ComponentsObject;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject;
  }

  export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
  }

  export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
  }

  export interface LicenseObject {
    name: string;
    url?: string;
  }

  export interface ServerObject {
    url: string;
    description?: string;
    variables?: { [variable: string]: ServerVariableObject };
  }

  export interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
  }

  export interface PathsObject {
    [pattern: string]: PathItemObject;
  }

  export interface PathItemObject {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    servers?: ServerObject[];
    parameters?: Array<ReferenceObject | ParameterObject>;
  }

  export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: Array<ReferenceObject | ParameterObject>;
    requestBody?: ReferenceObject | RequestBodyObject;
    responses?: ResponsesObject;
    callbacks?: { [callback: string]: ReferenceObject | CallbackObject };
    deprecated?: boolean;
    servers?: ServerObject[];
  }

  export interface ExternalDocumentationObject {
    description?: string;
    url: string;
  }

  export interface ParameterObject extends ParameterBaseObject {
    name: string;
    in: string;
  }

  export interface HeaderObject extends ParameterBaseObject {}

  interface ParameterBaseObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: ReferenceObject | SchemaObject;
    example?: any;
    examples?: { [media: string]: ReferenceObject | ExampleObject };
    content?: { [media: string]: MediaTypeObject };
  }
  export type NonArraySchemaObjectType =
    | 'null'
    | 'boolean'
    | 'object'
    | 'number'
    | 'string'
    | 'integer';
  export type ArraySchemaObjectType = 'array';
  export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: ReferenceObject | SchemaObject;
  }

  export interface NonArraySchemaObject extends BaseSchemaObject {
    type: NonArraySchemaObjectType;
  }

  interface BaseSchemaObject {
    // JSON schema allowed properties, adjusted for OpenAPI
    title?: string;
    description?: string;
    format?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalProperties?: boolean | ReferenceObject | SchemaObject;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    properties?: {
      [name: string]: ReferenceObject | SchemaObject;
    };
    allOf?: Array<ReferenceObject | SchemaObject>;
    oneOf?: Array<ReferenceObject | SchemaObject>;
    anyOf?: Array<ReferenceObject | SchemaObject>;
    not?: ReferenceObject | SchemaObject;

    // OpenAPI-specific properties
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    deprecated?: boolean;

    // Library internal properties
    componentId?: string;
  }

  export interface DiscriminatorObject {
    propertyName: string;
    mapping?: { [value: string]: string };
  }

  export interface XMLObject {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
  }

  export interface ReferenceObject {
    $ref: string;
  }

  export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }

  export interface MediaTypeObject {
    schema?: ReferenceObject | SchemaObject;
    example?: any;
    examples?: { [media: string]: ReferenceObject | ExampleObject };
    encoding?: { [media: string]: EncodingObject };
  }

  export interface EncodingObject {
    contentType?: string;
    headers?: { [header: string]: ReferenceObject | HeaderObject };
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
  }

  export interface RequestBodyObject {
    description?: string;
    content: { [media: string]: MediaTypeObject };
    required?: boolean;
  }

  export interface ResponsesObject {
    [code: string]: ReferenceObject | ResponseObject;
  }

  export interface ResponseObject {
    description: string;
    headers?: { [header: string]: ReferenceObject | HeaderObject };
    content?: { [media: string]: MediaTypeObject };
    links?: { [link: string]: ReferenceObject | LinkObject };
  }

  export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: { [parameter: string]: any };
    requestBody?: any;
    description?: string;
    server?: ServerObject;
  }

  export interface CallbackObject {
    [url: string]: PathItemObject;
  }

  export interface ComponentsObject {
    schemas?: { [key: string]: ReferenceObject | SchemaObject };
    responses?: { [key: string]: ReferenceObject | ResponseObject };
    parameters?: { [key: string]: ReferenceObject | ParameterObject };
    examples?: { [key: string]: ReferenceObject | ExampleObject };
    requestBodies?: { [key: string]: ReferenceObject | RequestBodyObject };
    headers?: { [key: string]: ReferenceObject | HeaderObject };
    securitySchemes?: { [key: string]: ReferenceObject | SecuritySchemeObject };
    links?: { [key: string]: ReferenceObject | LinkObject };
    callbacks?: { [key: string]: ReferenceObject | CallbackObject };
  }

  export type SecuritySchemeObject =
    | HttpSecurityScheme
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdSecurityScheme;

  export interface HttpSecurityScheme {
    type: 'http';
    description?: string;
    scheme: string;
    bearerFormat?: string;
  }

  export interface ApiKeySecurityScheme {
    type: 'apiKey';
    description?: string;
    name: string;
    in: string;
  }

  export interface OAuth2SecurityScheme {
    type: 'oauth2';
    flows: {
      implicit?: {
        authorizationUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      password?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      clientCredentials?: {
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
      authorizationCode?: {
        authorizationUrl: string;
        tokenUrl: string;
        refreshUrl?: string;
        scopes: { [scope: string]: string };
      };
    };
  }

  export interface OpenIdSecurityScheme {
    type: 'openIdConnect';
    description?: string;
    openIdConnectUrl: string;
  }

  export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
  }
}

export interface OpenAPIFrameworkPathObject {
  path?: string;
  module?: any;
}

interface OpenAPIFrameworkArgs {
  apiDoc: OpenAPIV3.Document | Promise<OpenAPIV3.Document> | string;
  validateApiSpec?: boolean;
}

export interface OpenAPIFrameworkAPIContext {
  // basePaths: BasePath[];
  basePaths: string[];
  getApiDoc(): OpenAPIV3.Document;
}

export interface OpenApiRequest {
  route: string,
  method: string,
  query?: Record<string, string>,
  headers?: Record<string, string>,
  body?: string,
  signedCookies?: Record<string, string>,
  cookies?: Record<string, string>,
  path?: Record<string, unknown>
}

export type OpenApiRequestHandler = (
  req: OpenApiRequest
) => void;

export interface IJsonSchema {
  id?: string;
  $schema?: string;
  title?: string;
  description?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;met
  pattern?: string;
  additionalItems?: boolean | IJsonSchema;
  items?: IJsonSchema | IJsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | IJsonSchema;
  definitions?: {
    [name: string]: IJsonSchema;
  };
  properties?: {
    [name: string]: IJsonSchema;
  };
  patternProperties?: {
    [name: string]: IJsonSchema;
  };
  dependencies?: {
    [name: string]: IJsonSchema | string[];
  };
  enum?: any[];
  type?: string | string[];
  allOf?: IJsonSchema[];
  anyOf?: IJsonSchema[];
  oneOf?: IJsonSchema[];
  not?: IJsonSchema;
}

export interface ValidationError {
  message?: string;
  status: number;
  errors: ValidationErrorItem[];
}

export interface ValidationErrorItem {
  path: string;
  message: string;
  error_code?: string;
}

interface ErrorHeaders {
  Allow?: string;
}

export class HttpError extends Error implements ValidationError {
  status!: number;
  path?: string;
  name!: string;
  message!: string;
  headers?: ErrorHeaders;
  errors!: ValidationErrorItem[];
  constructor(err: {
    status: number;
    path: string;
    name: string;
    message?: string;
    headers?: ErrorHeaders;
    errors?: ValidationErrorItem[];
  }) {
    super(err.name);
    this.name = err.name;
    this.status = err.status;
    this.path = err.path;
    this.message = err.message;
    this.headers = err.headers;
    this.errors = err.errors ?? [
      {
        path: err.path,
        message: err.message,
      },
    ];
  }
}

export class BadRequest extends HttpError {
  constructor(err: {
    path: string;
    message?: string;
    overrideStatus?: number;
    errors?: ValidationErrorItem[];
  }) {
    super({
      status: err.overrideStatus || 400,
      path: err.path,
      name: 'Bad Request',
      message: err.message,
      errors: err.errors,
    });
  }
}

export class UnsupportedMediaType extends HttpError {
  constructor(err: {
    path: string;
    message?: string;
    overrideStatus?: number;
  }) {
    super({
      status: err.overrideStatus || 415,
      path: err.path,
      name: 'Unsupported Media Type',
      message: err.message,
    });
  }
}
