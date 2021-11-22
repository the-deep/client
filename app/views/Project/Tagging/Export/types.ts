import {
    WidgetType,
    ProjectFrameworkDetailsQuery,
    AnalysisFrameworkExportableType,
} from '#generated/types';
import {
    Widget as WidgetFromAF,
    FrameworkExportableType,
} from '#types/newAnalyticalFramework';
import {
    DeepReplace,
} from '#utils/types';

// NOTE: this is also defined on TreeSelection component
export interface Node {
    key: string;
    title: string;
    selected: boolean;
    nodes?: this[];
}

export interface TreeSelectableWidget extends Node {
    id: string;
}

export interface ReportStructure {
    key: string;
    title: string;
    selected: boolean;
    draggable: boolean;
    nodes?: ReportStructure[];
}

type AnalysisFrameworkRaw = NonNullable<NonNullable<ProjectFrameworkDetailsQuery['project']>['analysisFramework']>;
export type AnalysisFramework = DeepReplace<
    DeepReplace<AnalysisFrameworkRaw, AnalysisFrameworkExportableType, FrameworkExportableType>,
    Omit<WidgetType, 'widgetIdDisplay' | 'widthDisplay'>,
    WidgetFromAF
>;
