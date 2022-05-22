import { randomString } from '@togglecorp/fujs';
import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
    defaultUndefinedType,
    requiredStringCondition,
    urlCondition,
    requiredCondition,
} from '@togglecorp/toggle-form';

import {
    ConnectorInputType,
    ReliefWebParams,
    UnhcrParams,
    RssFeedParams,
} from './types';

export type PartialFormType = PartialForm<ConnectorInputType, 'clientId' | 'source'>;
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
        };

        switch (value?.source) {
            case 'RELIEF_WEB': {
                const params: ObjectSchema<PartialForm<ReliefWebParams>> = {
                    fields: () => ({
                        from: [],
                        to: [],
                        'primary-country': [],
                        country: [],
                    }),
                    validation: (paramsValue) => {
                        if (
                            paramsValue
                            && paramsValue.to
                            && paramsValue.from
                            && new Date(paramsValue.from) > new Date(paramsValue.to)
                        ) {
                            return '"From" date should be smaller than "To" date';
                        }
                        return undefined;
                    },
                };

                return {
                    ...baseSchema,
                    params,
                };
            }
            case 'UNHCR': {
                const params: ObjectSchema<PartialForm<UnhcrParams>> = {
                    fields: () => ({
                        date_from: [],
                        date_to: [],
                        country: [],
                    }),
                    validation: (paramsValue) => {
                        if (
                            paramsValue
                            && paramsValue.date_to
                            && paramsValue.date_from
                            && new Date(paramsValue.date_from) > new Date(paramsValue.date_to)
                        ) {
                            return '"From" date should be smaller than "To" date';
                        }
                        return undefined;
                    },
                };
                return {
                    ...baseSchema,
                    params,
                };
            }
            case 'ATOM_FEED':
            case 'RSS_FEED': {
                const params: ObjectSchema<PartialForm<RssFeedParams>> = {
                    fields: () => ({
                        'feed-url': [requiredStringCondition, urlCondition],
                        'title-field': [requiredStringCondition],
                        'date-field': [requiredStringCondition],
                        'source-field': [requiredStringCondition],
                        'author-field': [requiredStringCondition],
                        'url-field': [requiredStringCondition],
                    }),
                };
                return {
                    ...baseSchema,
                    params,
                };
            }
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
        clientId: [],
        title: [requiredStringCondition],

        sources: sourcesSchema,
    }),
};

export const getDefaultValues = (): PartialFormType => ({
    clientId: randomString(),
    title: '',
});
