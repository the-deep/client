import { randomString } from '@togglecorp/fujs';
import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
    defaultUndefinedType,
    requiredStringCondition,
    requiredCondition,
} from '@togglecorp/toggle-form';

import { ConnectorInputType } from './types';

export type PartialFormType = PartialForm<ConnectorInputType, 'clientId' | 'source' | 'params'>;
export type PartialSourceType = NonNullable<PartialFormType['sources']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type SourcesSchema = ArraySchema<PartialSourceType, PartialFormType>;
type SourcesSchemaMember = ReturnType<SourcesSchema['member']>;

export type SourceFormSchema = ObjectSchema<PartialSourceType, PartialFormType>;
export type SourceFormSchemaFields = ReturnType<SourceFormSchema['fields']>;

export const sourceSchema:SourceFormSchema = {
    fields: (value): SourceFormSchemaFields => {
        const baseSchema: SourceFormSchemaFields = {
            clientId: [],
            id: [defaultUndefinedType],
            title: [requiredStringCondition],
            source: [requiredCondition],
            // FIXME: Define better schema
            params: [],
        };
        const reliefWebParamsSchema = {
            fromDate: [],
            toDate: [],
            primaryCountry: [requiredCondition],
            country: [],
        };

        switch (value?.source) {
            case 'RELIEF_WEB':
                return {
                    ...baseSchema,
                    params: {
                        fields: () => reliefWebParamsSchema,
                    },
                };
            default:
                return baseSchema;
        }
    },
};

const sourcesSchema: SourcesSchema = {
    keySelector: (col) => col.clientId,
    member: (): SourcesSchemaMember => sourceSchema,
};

export const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        clientId: [requiredStringCondition],
        title: [requiredStringCondition],

        sources: sourcesSchema,
    }),
};

export const getDefaultValues = (): PartialFormType => ({
    clientId: randomString(),
    title: '',
});
