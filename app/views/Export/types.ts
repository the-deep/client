import {
    WidgetType,
    ProjectFrameworkDetailsQuery,
    ExportFormatEnum,
} from '#generated/types';
import {
    Widget as WidgetFromAF,
    FrameworkExportableType,
    FrameworkFilterType,
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

export type TreeSelectableWidget = Node & WidgetFromAF & {
    id: string;
};

export interface ReportStructure {
    key: string;
    title: string;
    selected: boolean;
    draggable: boolean;
    nodes?: ReportStructure[];
}

type AnalysisFrameworkRaw = NonNullable<NonNullable<ProjectFrameworkDetailsQuery['project']>['analysisFramework']>;

type ExportableItem = NonNullable<AnalysisFrameworkRaw['exportables']>[number];
type FilterableItem = NonNullable<AnalysisFrameworkRaw['filters']>[number];

export type AnalysisFramework = DeepReplace<
    DeepReplace<
        DeepReplace<
            AnalysisFrameworkRaw,
            ExportableItem,
            FrameworkExportableType
        >,
        FilterableItem,
        FrameworkFilterType
    >,
    Omit<WidgetType, 'widgetIdDisplay' | 'widthDisplay'>,
    WidgetFromAF
>;

export interface ExportTypeItem {
    key: ExportFormatEnum;
    icon: React.ReactNode;
    title: string;
}

export interface ExportReportStructure {
    id: string;
    levels?: ExportReportStructure[];
}
