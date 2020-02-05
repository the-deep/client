import {
    FrameworkQuestionElement,
} from './questionnaire';

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


export interface GridLayoutElement {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface WidgetPropertiesElement<T> {
    data: T;
    addedFrom: 'overview' | 'list';
    listGridLayout: GridLayoutElement;
    overviewGridLayout: GridLayoutElement;
}

export interface WidgetElement<T> {
    id: number;
    key: string;
    widgetId: WidgetType;
    title?: string;
    properties: WidgetPropertiesElement<T>;
}

export interface FrameworkElement {
    id: number;
    widgets: WidgetElement<unknown>[];
    questions: FrameworkQuestionElement[];
    title: string;
}

// Matrix 2d

export interface Matrix2dCellElement {
    id: string;
    title?: string;
    tooltip?: string;
}

export interface Matrix2dFlatCellElement {
    id: string;
    title?: string;
    matrix2dId: number;
    matrix2dTitle?: string;
}

export type Matrix2dFlatSectorElement = Matrix2dFlatCellElement;
export interface Matrix2dFlatSubsectorElement extends Matrix2dFlatCellElement {
    sectorId: Matrix2dFlatSectorElement['id'];
}

export type Matrix2dFlatDimensionElement = Matrix2dFlatCellElement;
export interface Matrix2dFlatSubdimensionElement extends Matrix2dFlatCellElement {
    dimensionId: Matrix2dFlatDimensionElement['id'];
}

export type Matrix2dSubsectorElement = Matrix2dCellElement;
export interface Matrix2dSectorElement extends Matrix2dCellElement {
    subsectors: Matrix2dSubsectorElement[];
}

export type Matrix2dSubdimensionElement = Matrix2dCellElement;
export interface Matrix2dDimensionElement extends Matrix2dCellElement {
    color?: string;
    subdimensions: Matrix2dSubdimensionElement[];
}

export type Matrix2dWidgetElement = WidgetElement<{
    sectors: Matrix2dSectorElement[];
    dimensions: Matrix2dDimensionElement[];
}>;
