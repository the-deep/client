import {
    PurgeNull,
} from '@togglecorp/toggle-form';
import {
    Widget_Id as WidgetTypes,
    // NOTE: we can take any framework query that is complete
    CurrentFrameworkQuery,
    AnalysisFrameworkInputType,
} from '#generated/types';

// TODO: move to common utils
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
type DeepMandatory<T, K extends keyof any> = T extends object ? (
    T extends (infer I)[] ? (
        DeepMandatory<I, K>[]
    ) : (
        ({ [P1 in (Extract<keyof T, K>)]-?: NonNullable<T[P1]> } &
         { [P2 in keyof Pick<T, Exclude<keyof T, K>>]: DeepMandatory<T[P2], K> })
    )
) : T

// TODO: move to common utils
export type DeepReplace<T, A, B> = (
    T extends A
        ? B
        : (
            T extends (infer Z)[]
                ? DeepReplace<Z, A, B>[]
                : (
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    T extends object
                        ? { [K in keyof T]: DeepReplace<T[K], A, B> }
                        : T
                )
        )
)

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<CurrentFrameworkQuery['analysisFramework']>, 'key'>;
export type FrameworkInputRaw = DeepMandatory<PurgeNull<AnalysisFrameworkInputType>, 'clientId' | 'key' | 'widgetId' | 'order'>;

export type Types = WidgetTypes;

interface KeyLabelEntity {
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

interface BaseProperties<T> {
    defaultValue?: T;
}

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

// NOTE: we are replacing these with more strict types
type BaseWidget = Omit<WidgetRaw, 'widgetId' | 'properties'>;

export interface NumberWidget extends BaseWidget {
    widgetId: 'NUMBERWIDGET';
    properties: NumberProperties;
}
export interface TextWidget extends BaseWidget {
    widgetId: 'TEXTWIDGET';
    properties: BaseProperties<TextValue>;
}
export interface SingleSelectWidget extends BaseWidget {
    widgetId: 'SELECTWIDGET';
    properties: SingleSelectProperties;
}
export interface MultiSelectWidget extends BaseWidget {
    widgetId: 'MULTISELECTWIDGET';
    properties: MultiSelectProperties;
}
export interface DateWidget extends BaseWidget {
    widgetId: 'DATEWIDGET';
    properties: BaseProperties<DateValue>;
}
export interface TimeWidget extends BaseWidget {
    widgetId: 'TIMEWIDGET';
    properties: BaseProperties<TimeValue>;
}
export interface TimeRangeWidget extends BaseWidget {
    widgetId: 'TIMERANGEWIDGET';
    properties: BaseProperties<TimeRangeValue>;
}
export interface DateRangeWidget extends BaseWidget {
    widgetId: 'DATERANGEWIDGET';
    properties: BaseProperties<DateRangeValue>;
}
export interface Matrix1dWidget extends BaseWidget {
    widgetId: 'MATRIX1DWIDGET';
    properties: Matrix1dProperties;
}
export interface Matrix2dWidget extends BaseWidget {
    widgetId: 'MATRIX2DWIDGET';
    properties: Matrix2Properties;
}
export interface OrganigramWidget extends BaseWidget {
    widgetId: 'ORGANIGRAMWIDGET';
    properties: OrganigramProperties;
}
export interface ScaleWidget extends BaseWidget {
    widgetId: 'SCALEWIDGET';
    properties: ScaleProperties;
}
export interface GeoLocationWidget extends BaseWidget {
    widgetId: 'GEOWIDGET';
    properties: GeoLocationProperties;
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

// NOTE: Same WidgetRaw is used for Framework in both query and mutation
type WidgetRaw = NonNullable<FrameworkInputRaw['secondaryTagging']>[number];

export type Framework = DeepReplace<FrameworkRaw, WidgetRaw, Widget>;
export type FrameworkInput = DeepReplace<FrameworkInputRaw, WidgetRaw, Widget>;

export type Section = NonNullable<NonNullable<FrameworkInput['primaryTagging']>[number]>;
