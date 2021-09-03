import {
    Widget_Id as WidgetTypes,
    WidgetWidth,
} from '#generated/types';

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

export type Types = WidgetTypes;

interface BasicEntity {
    id: string;
    createdAt: string;
    createdBy: number;
    createdByName: string;
}
interface KeyLabel {
    clientId: string;
    label: string;
    tooltip?: string;
    order: number;
}
interface KeyLabelColor extends KeyLabel {
    color: string;
}

/*
interface Condition {
    clientId: string;
    type: unknown;
    directive: unknown;

    order: number;
    conjunction: 'XOR' | 'OR' | 'AND' | 'NOR' | 'NAND' | 'NXOR';
}
*/

interface BaseData<T> {
    defaultValue?: T;
}

interface NumberData extends BaseData<NumberValue> {
    maxValue?: number;
    minValue?: number;
}

interface SingleSelectData extends BaseData<SingleSelectValue> {
    options: KeyLabel[];
}
interface MultiSelectData extends BaseData<MultiSelectValue> {
    options: KeyLabel[];
}
interface ScaleData extends BaseData<ScaleValue> {
    options: KeyLabelColor[];
}

interface OrganigramDatum extends KeyLabel {
    children: OrganigramDatum[];
}
interface OrganigramData extends BaseData<OrganigramValue> {
    options: OrganigramDatum;
}

interface GeoLocationData extends BaseData<GeoLocationValue> {
}

interface Matrix1dRows extends KeyLabelColor {
    cells: KeyLabel[]
}
interface Matrix1dData extends BaseData<undefined> {
    rows: Matrix1dRows[]
}

interface Matrix2dRows extends KeyLabelColor {
    subRows: KeyLabel[]
}
interface Matrix2dColumns extends KeyLabel {
    subColumns: KeyLabel[]
}

interface Matrix2Data extends BaseData<undefined> {
    rows: Matrix2dRows[];
    columns: Matrix2dColumns[];
}

interface BaseWidget {
    clientId: string;
    // TODO: clientId should always sync with key
    key: string;

    id: string;
    order: number;
    title: string;

    width?: WidgetWidth;

    widgetId: Types;
    // eslint-disable-next-line @typescript-eslint/ban-types
    properties: object;

    /*
    parent?: string;
    condition?: Condition[];
    */
}

export interface NumberWidget extends BaseWidget {
    widgetId: 'NUMBERWIDGET';
    properties: NumberData;
}
export interface TextWidget extends BaseWidget {
    widgetId: 'TEXTWIDGET';
    properties: BaseData<TextValue>;
}
export interface SingleSelectWidget extends BaseWidget {
    widgetId: 'SELECTWIDGET';
    properties: SingleSelectData;
}
export interface MultiSelectWidget extends BaseWidget {
    widgetId: 'MULTISELECTWIDGET';
    properties: MultiSelectData;
}
export interface DateWidget extends BaseWidget {
    widgetId: 'DATEWIDGET';
    properties: BaseData<DateValue>;
}
export interface TimeWidget extends BaseWidget {
    widgetId: 'TIMEWIDGET';
    properties: BaseData<TimeValue>;
}
export interface TimeRangeWidget extends BaseWidget {
    widgetId: 'TIMERANGEWIDGET';
    properties: BaseData<TimeRangeValue>;
}
export interface DateRangeWidget extends BaseWidget {
    widgetId: 'DATERANGEWIDGET';
    properties: BaseData<DateRangeValue>;
}
export interface Matrix1dWidget extends BaseWidget {
    widgetId: 'MATRIX1DWIDGET';
    properties: Matrix1dData;
}
export interface Matrix2dWidget extends BaseWidget {
    widgetId: 'MATRIX2DWIDGET';
    properties: Matrix2Data;
}
export interface OrganigramWidget extends BaseWidget {
    widgetId: 'ORGANIGRAMWIDGET';
    properties: OrganigramData;
}
export interface ScaleWidget extends BaseWidget {
    widgetId: 'SCALEWIDGET';
    properties: ScaleData;
}
interface GeoLocationWidget extends BaseWidget {
    widgetId: 'GEOWIDGET';
    properties: GeoLocationData;
}

export type Widget = NumberWidget
    | TextWidget
    | SingleSelectWidget
    | MultiSelectWidget
    | DateWidget
    | TimeWidget
    | TimeRangeWidget
    | DateRangeWidget
    | Matrix1dWidget
    | Matrix2dWidget
    | OrganigramWidget
    | GeoLocationWidget
    | ScaleWidget;

export interface Section {
    clientId: string;
    id: string;
    order: number;
    title: string;
    tooltip?: string;
    widgets?: Widget[];
}

export interface AnalysisFramework extends BasicEntity {
    title: string;
    members: number[];
    referenceImage?: string;

    isPrivate?: boolean;

    description?: string;

    organization?: number;
    organizationDetails?: {
        id: number;
        title: string;
        shortName: string;
    };

    primaryTagging: Section[];
    secondaryTagging: Widget[];
}
