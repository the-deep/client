import {
    // NOTE: Taking WidgetType instead of WidgetInputType
    WidgetType as WidgetRaw,
    WidgetWidgetTypeEnum as WidgetTypes,
} from '#generated/types';

export type Types = WidgetTypes;

// NOTE: we are replacing these with more strict types
export type BaseWidget = Omit<WidgetRaw, 'widgetId' | 'properties' | 'widgetIdDisplay' | 'widthDisplay'>;

interface BaseProperties<T> {
    defaultValue?: T;
}

export interface KeyLabelEntity {
    // FIXME: clientId should be renamed to be key
    clientId: string;
    label: string;
    tooltip?: string;
    order: number;
}
export interface KeyLabelColorEntity extends KeyLabelEntity {
    color: string;
}

/*
interface Condition
    clientId: string;
    type: unknown;
    directive: unknown;

    order: number;
    conjunction: 'XOR' | 'OR' | 'AND' | 'NOR' | 'NAND' | 'NXOR';
}
*/

export type NumberValue = number;
export type TextValue = string;
export type DateValue = string;
export type TimeValue = string;
export type DateRangeValue = {
    startDate: string;
    endDate: string;
};
export type TimeRangeValue = {
    startTime: string;
    endTime: string;
};
export type SingleSelectValue = string;
export type MultiSelectValue = string[];
export type ScaleValue = string;
export type OrganigramValue = string[];
export type GeoLocationValue = string[];
export type Matrix1dValue = {
    [key: string]: {
        [key: string]: boolean | undefined,
    } | undefined,
}
export type Matrix2dValue = {
    [key: string]: {
        [key: string]: {
            [key: string]: string[] | undefined,
        } | undefined,
    } | undefined,
};

interface NumberProperties extends BaseProperties<NumberValue> {
    maxValue?: number;
    minValue?: number;
}

interface SingleSelectProperties extends BaseProperties<SingleSelectValue> {
    options: KeyLabelEntity[];
}
interface MultiSelectProperties extends BaseProperties<MultiSelectValue> {
    options: KeyLabelEntity[];
}
interface ScaleProperties extends BaseProperties<ScaleValue> {
    options: KeyLabelColorEntity[];
}

export interface OrganigramDatum extends KeyLabelEntity {
    children: OrganigramDatum[] | undefined;
}

interface OrganigramProperties extends BaseProperties<OrganigramValue> {
    options: OrganigramDatum;
}

interface GeoLocationProperties extends BaseProperties<GeoLocationValue> {
}

export interface Matrix1dRows extends KeyLabelColorEntity {
    cells: KeyLabelEntity[]
}
interface Matrix1dProperties extends BaseProperties<undefined> {
    rows: Matrix1dRows[]
}

export interface Matrix2dRows extends KeyLabelColorEntity {
    subRows: KeyLabelEntity[]
}
export interface Matrix2dColumns extends KeyLabelEntity {
    subColumns: KeyLabelEntity[]
}

interface Matrix2dProperties extends BaseProperties<undefined> {
    rows: Matrix2dRows[];
    columns: Matrix2dColumns[];
}

export interface NumberWidget extends BaseWidget {
    widgetId: 'NUMBER';
    properties: NumberProperties | undefined;
}
export interface TextWidget extends BaseWidget {
    widgetId: 'TEXT';
    properties: BaseProperties<TextValue> | undefined;
}
export interface SingleSelectWidget extends BaseWidget {
    widgetId: 'SELECT';
    properties: SingleSelectProperties | undefined;
}
export interface MultiSelectWidget extends BaseWidget {
    widgetId: 'MULTISELECT';
    properties: MultiSelectProperties | undefined;
}
export interface DateWidget extends BaseWidget {
    widgetId: 'DATE';
    properties: BaseProperties<DateValue> | undefined;
}
export interface TimeWidget extends BaseWidget {
    widgetId: 'TIME';
    properties: BaseProperties<TimeValue> | undefined;
}
export interface TimeRangeWidget extends BaseWidget {
    widgetId: 'TIME_RANGE';
    properties: BaseProperties<TimeRangeValue> | undefined;
}
export interface DateRangeWidget extends BaseWidget {
    widgetId: 'DATE_RANGE';
    properties: BaseProperties<DateRangeValue> | undefined;
}
export interface Matrix1dWidget extends BaseWidget {
    widgetId: 'MATRIX1D';
    properties: Matrix1dProperties | undefined;
}
export interface Matrix2dWidget extends BaseWidget {
    widgetId: 'MATRIX2D';
    properties: Matrix2dProperties | undefined;
}
export interface OrganigramWidget extends BaseWidget {
    widgetId: 'ORGANIGRAM';
    properties: OrganigramProperties | undefined;
}
export interface ScaleWidget extends BaseWidget {
    widgetId: 'SCALE';
    properties: ScaleProperties | undefined;
}
export interface GeoLocationWidget extends BaseWidget {
    widgetId: 'GEO';
    properties: GeoLocationProperties | undefined;
}

export type Widget = TextWidget
    | NumberWidget
    | TimeWidget
    | DateWidget
    | TimeRangeWidget
    | DateRangeWidget
    | SingleSelectWidget
    | MultiSelectWidget
    | ScaleWidget
    | OrganigramWidget
    | GeoLocationWidget
    | Matrix1dWidget
    | Matrix2dWidget;
