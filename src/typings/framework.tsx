export interface Matrix2dCellElement {
    id: string;
    title?: string;
    tooltip?: string;
}

export interface Matrix2dFlatCellElement {
    id: string;
    title?: string;
    matrix2dId: WidgetElement['id'];
    matrix2dTitle: WidgetElement['title'];
}

export interface Matrix2dFlatSectorElement extends Matrix2dFlatCellElement {}
export interface Matrix2dFlatSubsectorElement extends Matrix2dFlatCellElement {
    sectorId: Matrix2dFlatSectorElement['id'];
}

export interface Matrix2dFlatDimensionElement extends Matrix2dFlatCellElement {}
export interface Matrix2dFlatSubdimensionElement extends Matrix2dFlatCellElement {
    dimensionId: Matrix2dFlatDimensionElement['id'];
}

export interface Matrix2dSubsectorElement extends Matrix2dCellElement {}

export interface Matrix2dSectorElement extends Matrix2dCellElement {
    subsectors: Matrix2dSubsectorElement[];
}

export interface Matrix2dSubdimensionElement extends Matrix2dCellElement {}

export interface Matrix2dDimensionElement extends Matrix2dCellElement {
    color?: string;
    subdimensions: Matrix2dSubdimensionElement[];
}

// TODO: complete this list
type WidgetType = 'multiselectWidget' | 'matrix1dWidget' | 'matrix2dWidget';

export interface GridLayoutElement {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface WidgetPropertiesElement {
    data: object;
    addedFrom: 'overview' | 'list';
    listGridLayout: GridLayoutElement;
    overviewGridLayout: GridLayoutElement;
}

export interface WidgetElement {
    id: number;
    key: string;
    widgetId: WidgetType;
    title?: string;
    properties: WidgetPropertiesElement;
}

export interface Matrix2dWidgetPropertiesElement extends WidgetPropertiesElement {
    data: {
        sectors: Matrix2dSectorElement[];
        dimensions: Matrix2dDimensionElement[];
    };
}

export interface Matrix2dWidgetElement extends WidgetElement {
    properties: Matrix2dWidgetPropertiesElement;
}

