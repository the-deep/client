import {
    PurgeNull,
} from '@togglecorp/toggle-form';
import { EnumFix, DeepReplace } from '#utils/types';
import {
    AnalysisFrameworkFilterType as AnalysisFrameworkFilterTypeRaw,
    ProjectSourcesQueryVariables,
    SourceFilterOptionsQuery,
    AnalysisFrameworkFilterType,
} from '#generated/types';

type BaseFilterType = Omit<AnalysisFrameworkFilterTypeRaw, 'properties'>;

export interface KeyLabelEntity {
    // FIXME: clientId should be renamed to be key
    clientId: string;
    label: string;
    tooltip?: string;
    order: number;
}

export interface KeyLabel {
    key: string;
    label: string;
}

interface BaseProperties<T> {
    type: string;
    options?: T[];
}

interface TextFilterType extends BaseFilterType {
    widgetType: 'TEXT';
    properties?: {
        type: string;
    };
}

interface NumberFilterType extends BaseFilterType {
    widgetType: 'NUMBER';
    properties?: {
        type: string;
    };
}

interface TimeFilterType extends BaseFilterType {
    widgetType: 'TIME';
    properties?: {
        type: string;
    };
}

interface DateFilterType extends BaseFilterType {
    widgetType: 'DATE';
    properties?: {
        type: string;
    };
}

interface TimeRangeFilterType extends BaseFilterType {
    widgetType: 'TIME_RANGE';
    properties?: {
        type: string;
    };
}

interface DateRangeFilterType extends BaseFilterType {
    widgetType: 'DATE_RANGE';
    properties?: {
        type: string;
    };
}

interface SingleSelectFilterType extends BaseFilterType {
    widgetType: 'SELECT';
    properties?: BaseProperties<KeyLabelEntity>;
}

interface MultiSelectFilterType extends BaseFilterType {
    widgetType: 'MULTISELECT';
    properties?: BaseProperties<KeyLabelEntity>;
}

interface ScaleFilterType extends BaseFilterType {
    widgetType: 'SCALE';
    properties?: BaseProperties<KeyLabel>;
}

export interface OrganigramDatum extends KeyLabel {
    children: OrganigramDatum[];
}

interface OrganigramFilterType extends BaseFilterType {
    widgetType: 'ORGANIGRAM';
    properties?: BaseProperties<OrganigramDatum>;
}

interface GeoLocationFilterType extends BaseFilterType {
    widgetType: 'GEO';
    properties?: BaseProperties<KeyLabelEntity>;
}

interface Matrix1dFilterType extends BaseFilterType {
    widgetType: 'MATRIX1D';
    properties?: BaseProperties<KeyLabel>;
}

interface Matrix2dFilterType extends BaseFilterType {
    widgetType: 'MATRIX2D';
    properties?: BaseProperties<KeyLabel>;
}

export type FrameworkFilterType = TextFilterType
    | NumberFilterType
    | TimeFilterType
    | DateFilterType
    | TimeRangeFilterType
    | DateRangeFilterType
    | SingleSelectFilterType
    | MultiSelectFilterType
    | ScaleFilterType
    | OrganigramFilterType
    | GeoLocationFilterType
    | Matrix1dFilterType
    | Matrix2dFilterType;

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
    Omit<AnalysisFrameworkFilterType, 'widgetTypeDisplay' | 'filterTypeDisplay'>,
    FrameworkFilterType
>
