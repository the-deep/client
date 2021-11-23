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

export type SourcesFilterFields = PurgeNull<EnumFix<ProjectSourcesQueryVariables,
    'statuses'
    | 'confidentiality'
    | 'exists'
    | 'priorities'
    | 'statuses'
    | 'commentStatus'
    | 'entryTypes'
>>;

export type SourceFilterOptions = DeepReplace<
    SourceFilterOptionsQuery,
    Omit<AnalysisFrameworkFilterTypeRaw, 'widgetTypeDisplay' | 'filterTypeDisplay'>,
    FrameworkFilterType
>;
