import {
    ObjectSchema,
} from '@togglecorp/toggle-form';

import {
    LeadEmmTriggerInputType,
    EmmEntityInputType,
    LeadInputType,
} from '#generated/types';
import {
    PartialLeadType,
    leadSchema,
} from '#components/general/BulkUploadModal/schema';

import { EnumFix } from '#utils/types';

export type EmmTrigger = LeadEmmTriggerInputType;

export type EmmEntity = EmmEntityInputType;

export type Lead = EnumFix<LeadInputType, 'priority' | 'confidentiality'>;

export type PartialFormType = PartialLeadType;
export type LeadFormSchema = ObjectSchema<PartialFormType>;
export type LeadFormSchemaFields = ReturnType<LeadFormSchema['fields']>;

export const schema = leadSchema;
