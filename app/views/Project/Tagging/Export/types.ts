import {
    WidgetType,
    ProjectFrameworkDetailsQuery,
    ProjectExportsQuery,
} from '#generated/types';
import {
    Widget as WidgetFromAF,
} from '#types/newAnalyticalFramework';
import {
    DeepReplace,
} from '#utils/types';

interface DateValue {
    startDate: string;
    endDate: string;
}

interface TimeValue {
    startTime: string;
    endTime: string;
}
export interface EntryFilterType {
    [key: string]: string |
        string[] | EntryFilterType | boolean | undefined | DateValue | TimeValue;
}

export interface SourceEntryFilter {
    createdAt?: {
        startDate: string;
        endDate: string;
    };
    publishedOn?: {
        startDate: string;
        endDate: string;
    };
    assignee?: string[];
    status?: string[];
    search?: string;
    exists?: string;
    priority?: string[];
    authoringOrganizationTypes?: string[];
    confidentiality?: string[];
    emmRiskFactors?: string[];
    emmKeywords?: string[];
    emmEntities?: string[];
    entriesFilter?: EntryFilterType;
}

export interface Node {
    selected: boolean;
    key: string;
    title: string;
    nodes?: this[];
}

export interface TreeSelectableWidget<T extends string> extends Node {
    id: T;
}

type AnalysisFrameworkRaw = NonNullable<NonNullable<ProjectFrameworkDetailsQuery['project']>['analysisFramework']>;

export type AnalysisFramework = DeepReplace<AnalysisFrameworkRaw, Omit<WidgetType, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;

export type Widget = Pick<WidgetType, 'id' | 'title' | 'widgetId' | 'clientId' | 'order' | 'properties' | 'key'>;

export type Export = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];
