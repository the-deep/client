import {
    PurgeNull,
} from '@togglecorp/toggle-form';
import { EnumFix } from '#utils/types';
import {
    ProjectDetailTypeLeadsArgs,
} from '#generated/types';

export type SourcesFilterFields = PurgeNull<EnumFix<ProjectDetailTypeLeadsArgs,
    'statuses'
    | 'extractionStatus'
    | 'sourceTypes'
    | 'confidentiality'
    | 'priorities'
    | 'ordering'

    | 'entryTypes'
>> & { projectId: string };
