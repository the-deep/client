import {
    // NOTE: Taking WidgetType instead of WidgetInputType
    WidgetType as WidgetRaw,
    WidgetWidgetTypeEnum as WidgetTypes,
} from '#generated/types';

export type Types = WidgetTypes;

// NOTE: we are replacing these with more strict types
type BaseWidget = Omit<WidgetRaw, 'widgetId' | 'properties'>;

interface BaseProperties<T> {
    defaultValue?: T;
}

interface KeyLabelEntity {
    // FIXME: clientId should be renamed to be key
    clientId: string;
    label: string;
    tooltip?: string;
    order: number;
}
interface KeyLabelColorEntity extends KeyLabelEntity {
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

interface OrganigramDatum extends KeyLabelEntity {
    children: OrganigramDatum[];
}

interface OrganigramProperties extends BaseProperties<OrganigramValue> {
    options: OrganigramDatum;
}

interface GeoLocationProperties extends BaseProperties<GeoLocationValue> {
}

interface Matrix1dRows extends KeyLabelColorEntity {
    cells: KeyLabelEntity[]
}
interface Matrix1dProperties extends BaseProperties<undefined> {
    rows: Matrix1dRows[]
}

interface Matrix2dRows extends KeyLabelColorEntity {
    subRows: KeyLabelEntity[]
}
interface Matrix2dColumns extends KeyLabelEntity {
    subColumns: KeyLabelEntity[]
}

interface Matrix2Properties extends BaseProperties<undefined> {
    rows: Matrix2dRows[];
    columns: Matrix2dColumns[];
}

export interface NumberWidget extends BaseWidget {
    widgetId: 'NUMBER';
    properties: NumberProperties;
}
export interface TextWidget extends BaseWidget {
    widgetId: 'TEXT';
    properties: BaseProperties<TextValue>;
}
export interface SingleSelectWidget extends BaseWidget {
    widgetId: 'SELECT';
    properties: SingleSelectProperties;
}
export interface MultiSelectWidget extends BaseWidget {
    widgetId: 'MULTISELECT';
    properties: MultiSelectProperties;
}
export interface DateWidget extends BaseWidget {
    widgetId: 'DATE';
    properties: BaseProperties<DateValue>;
}
export interface TimeWidget extends BaseWidget {
    widgetId: 'TIME';
    properties: BaseProperties<TimeValue>;
}
export interface TimeRangeWidget extends BaseWidget {
    widgetId: 'TIME_RANGE';
    properties: BaseProperties<TimeRangeValue>;
}
export interface DateRangeWidget extends BaseWidget {
    widgetId: 'DATE_RANGE';
    properties: BaseProperties<DateRangeValue>;
}
export interface Matrix1dWidget extends BaseWidget {
    widgetId: 'MATRIX1D';
    properties: Matrix1dProperties;
}
export interface Matrix2dWidget extends BaseWidget {
    widgetId: 'MATRIX2D';
    properties: Matrix2Properties;
}
export interface OrganigramWidget extends BaseWidget {
    widgetId: 'ORGANIGRAM';
    properties: OrganigramProperties;
}
export interface ScaleWidget extends BaseWidget {
    widgetId: 'SCALE';
    properties: ScaleProperties;
}
export interface GeoLocationWidget extends BaseWidget {
    widgetId: 'GEO';
    properties: GeoLocationProperties;
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
