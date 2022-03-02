import { randomString } from '@togglecorp/fujs';
import {
    ObjectSchema,
    ArraySchema,
    PartialForm,
    defaultUndefinedType,
    requiredStringCondition,
    requiredCondition,
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    UnifiedConnectorInputType,
    ConnectorSourceGqInputType,
} from '#generated/types';
import {
    EnumFix,
    DeepReplace,
    DeepMandatory,
} from '#utils/types';

interface Params {}

export type SourceInput = Omit<EnumFix<DeepMandatory<PurgeNull<ConnectorSourceGqInputType>, 'clientId'>, 'source'>, 'params'> & {
    params: Params;
};

export type ConnectorInputType = DeepReplace<
    PurgeNull<UnifiedConnectorInputType>,
    ConnectorSourceGqInputType,
    SourceInput
>;

export type PartialFormType = PartialForm<ConnectorInputType, 'clientId'>;
export type PartialSourceType = NonNullable<PartialFormType['sources']>[number];

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type SourcesSchema = ArraySchema<PartialSourceType, PartialFormType>;
type SourcesSchemaMember = ReturnType<SourcesSchema['member']>;

export type SourceFormSchema = ObjectSchema<PartialSourceType, PartialFormType>;
export type SourceFormSchemaFields = ReturnType<SourceFormSchema['fields']>;

export const sourceSchema:SourceFormSchema = {
    fields: (): SourceFormSchemaFields => {
        const baseSchema: SourceFormSchemaFields = {
            clientId: [],
            id: [defaultUndefinedType],
            title: [requiredStringCondition],
            source: [requiredCondition],
            // FIXME: Define better schema
            params: [],
        };
        return baseSchema;
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
