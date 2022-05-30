import {
    WidgetType,
    ProjectFrameworkDetailsQuery,
    AnalysisFrameworkExportableType,
    ExportFormatEnum,
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
export type AnalysisFramework = DeepReplace<
    DeepReplace<AnalysisFrameworkRaw, AnalysisFrameworkExportableType, FrameworkExportableType>,
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
