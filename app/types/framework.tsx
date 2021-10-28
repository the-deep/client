import { DatabaseEntityBase } from './common';
import { FrameworkQuestionElement } from './questionnaire';

type WidgetType = 'excerptWidget'
    | 'textWidget'
    | 'matrix1dWidget'
    | 'matrix2dWidget'
    | 'numberMatrixWidget'
    | 'dateWidget'
    | 'timeWidget'
    | 'timeRangeWidget'
    | 'dateRangeWidget'
    | 'numberWidget'
    | 'scaleWidget'
    | 'geoWidget'
    | 'organigramWidget'
    | 'selectWidget'
    | 'multiselectWidget'
    | 'conditionalWidget';

export interface WidgetElement<T> {
    id: number;
    key: string;
    widgetId: WidgetType;
    order: number;
    section: number;
    title: string;
    properties: T;
}

// FIXME: merge with FrameworkFields
export interface FrameworkElement {
    id: number;
    widgets: WidgetElement<unknown>[];
    questions: FrameworkQuestionElement[];
    title: string;
    exportables?: unknown[];
}

// Matrix 2d

export interface Matrix2dCellElement {
    clientId: string;
    label: string;
    order: number;
}

export type Matrix2dSubColumnElement = Matrix2dCellElement;
export interface Matrix2dColumnElement extends Matrix2dCellElement {
    subColumns: Matrix2dSubColumnElement[];
}
export type Matrix2dSubRowElement = Matrix2dCellElement;
export interface Matrix2dRowElement extends Matrix2dCellElement {
    color?: string;
    subRows: Matrix2dSubRowElement[];
}

export type Matrix2dWidgetElement = WidgetElement<{
    columns: Matrix2dColumnElement[];
    rows: Matrix2dRowElement[];
}>;

export interface ExportableFields {
    id: number;
    inline: boolean;
    order: number;
    widgetKey: string;
    data?: {
        excel?: {
            // TODO; use actual enum
            type: string;
            title: string;
            children: unknown[];
        };
        report?: {
            levels: unknown[];
        };
    };
}

export interface FilterOption {
    key: string;
    label: string;
}

export interface FilterFields {
    filterType: string;
    id: number;
    key: string;
    title: string;
    widgetKey: string;
    properties: {
        // TODO: use actual enum
        type: string;
        options: FilterOption[];
    };
}

export interface FrameworkFields extends DatabaseEntityBase {
    allProjectsCount: number;
    description: string;
    entriesCount: number;
    exportables: ExportableFields[];
    filters: FilterFields[];
    idAdmin: boolean;
    isPrivate: boolean;
    members: number[];
    properties: unknown;
    questions: unknown[];
    role: {
        id: number;
        title: string;
        isPrivateRole: boolean;
        canAddUse: boolean;
        canCloneFramework: boolean;
        canEditFramework: boolean;
        canUseInOtherProjects: boolean;
    };
    title: string;
    usersWithAddPermission: {
        id: number;
        displayName: string;
        email: string;
    }[];
    visibleProjects: {
        id: number;
        isPrivate: boolean;
        title: string;
    }[];
    widgets: WidgetElement<unknown>[];
}
// Matrix 1d

export interface Matrix1dCellElement {
    key: string;
    tooltip?: string;
    value: string;
}
export interface Matrix1dRowElement {
    key: string;
    title: string;
    tooltip: string;
    color?: string;
    cells: Matrix1dCellElement[];
}

export type Matrix1dWidgetElement = WidgetElement<{rows: Matrix1dRowElement[]}>

export interface MatrixTocElement {
    id: string;
    key?: string;
    title: string;
    altTitle?: string;
    verified?: number;
    unverified?: number;
    children?: MatrixTocElement[] | [];
    uniqueId: string;
}

export interface ScaleWidget {
    scaleUnits: {
        key: string;
        color?: string;
        label: string;
    }[];
}

export interface ConditionalWidget {
    defaultWidget: string;
    widgets: {
        conditions: unknown;
        widget: {
            id: number;
            title: string;
            key: string;
            widgetId: string;
            properties: {
                data: unknown;
            };
        };
    }[];
}

export type TreeSelectableWidget<T extends string | number> = {
    key: string;
    id: T;
    title: string;
    selected: boolean;
    draggable: boolean;
    actualTitle?: string;
    conditionalId?: number;
    isConditional?: boolean;
}

export interface Level {
    id: string;
    title: string;
    sublevels?: Level[];
}

export interface ReportStructure {
    title: string;
    key: string;
    selected: boolean;
    draggable: boolean;
    nodes?: ReportStructure[];
}
