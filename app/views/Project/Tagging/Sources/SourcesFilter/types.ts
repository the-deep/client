import {
    PurgeNull,
} from '@togglecorp/toggle-form';
import { EnumFix, DeepReplace } from '#utils/types';
import {
    AnalysisFrameworkFilterType as AnalysisFrameworkFilterTypeRaw,
    ProjectSourcesQueryVariables,
    SourceFilterOptionsQuery,
} from '#generated/types';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';

// FIXME: why did we use ProjectSourcesQueryVariables
export type SourcesFilterFields = PurgeNull<EnumFix<ProjectSourcesQueryVariables,
    'statuses'
    | 'confidentiality'
    | 'priorities'
    | 'entryTypes'
    | 'ordering'
>>;

// FIXME: why did we use SourceFilterOptionsQuery
export type SourceFilterOptions = DeepReplace<
    SourceFilterOptionsQuery,
    Omit<AnalysisFrameworkFilterTypeRaw, 'widgetTypeDisplay' | 'filterTypeDisplay'>,
    FrameworkFilterType
>;
