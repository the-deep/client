import {
    listToMap,
    isDefined,
    isNotDefined,
    intersection,
    mapToList,
} from '@togglecorp/fujs';
import {
    PartialForm,
} from '@togglecorp/toggle-form';
import {
    // NOTE: Taking WidgetType instead of WidgetInputType
    WidgetType as WidgetRaw,
    WidgetWidgetTypeEnum as WidgetTypes,
    AnalysisFrameworkFilterType as AnalysisFrameworkFilterTypeRaw,
} from '#generated/types';

import {
    WidgetAttribute,
    TextWidgetAttribute,
    NumberWidgetAttribute,
    DateWidgetAttribute,
    TimeWidgetAttribute,
    DateRangeWidgetAttribute,
    TimeRangeWidgetAttribute,
    GeoLocationWidgetAttribute,
    ScaleWidgetAttribute,
    SingleSelectWidgetAttribute,
    MultiSelectWidgetAttribute,
    Matrix1dWidgetAttribute,
    Matrix2dWidgetAttribute,
    OrganigramWidgetAttribute,
} from './newEntry';

function invertBoolean(value: boolean | undefined, invert: boolean) {
    if (value === undefined) {
        return false;
    }
    return invert ? !value : value;
}

type PartializeAttribute<T> = PartialForm<T, 'clientId' | 'widgetType' | 'widget' | 'data' | 'widgetVersion'>;

type PartialWidgetAttribute = PartializeAttribute<WidgetAttribute>;

export type Types = WidgetTypes;

export type Conjunction = 'XOR' | 'OR' | 'AND';

interface BaseCondition {
    key: string;
    conjunctionOperator: Conjunction;
    order: number;
    invert: boolean;
}

interface BaseConditional {
    // Rename parentId to parentWidget
    // FIXME: id is undefined only for input
    // id of parent widget
    parentWidget: string | undefined;
    parentWidgetType: string;
    conditions: unknown[];
}

export interface EmptyCondition extends BaseCondition {
    operator: 'empty';
}

export interface NumberGreaterThanCondition extends BaseCondition {
    operator: 'number-greater-than';
    value: number;
}
export interface NumberLessThanCondition extends BaseCondition {
    operator: 'number-less-than';
    value: number;
}
export interface NumberEqualToCondition extends BaseCondition {
    operator: 'number-equal-to';
    value: number;
}

export interface TextStartsWithCondition extends BaseCondition {
    operator: 'text-starts-with';
    value: string;
}
export interface TextEndsWithCondition extends BaseCondition {
    operator: 'text-ends-with';
    value: string;
}
export interface TextContainsCondition extends BaseCondition {
    operator: 'text-contains';
    value: string;
}

export interface SingleSelectSelectedCondition extends BaseCondition {
    operator: 'single-selection-selected';
    // operatorModifier: 'some';
    value: string[];
}

export interface MultiSelectSelectedCondition extends BaseCondition {
    operator: 'multi-selection-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}

export interface OrganigramSelectedCondition extends BaseCondition {
    operator: 'organigram-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}

export interface ScaleSelectedCondition extends BaseCondition {
    operator: 'scale-selected';
    value: string[];
}
export interface DateAfterCondition extends BaseCondition {
    operator: 'date-after';
    value: string;
}
export interface DateBeforeCondition extends BaseCondition {
    operator: 'date-before';
    value: string;
}
export interface DateEqualToCondition extends BaseCondition {
    operator: 'date-equal-to';
    value: string;
}
export interface TimeAfterCondition extends BaseCondition {
    operator: 'time-after';
    value: string;
}
export interface TimeBeforeCondition extends BaseCondition {
    operator: 'time-before';
    value: string;
}
export interface TimeEqualToCondition extends BaseCondition {
    operator: 'time-equal-to';
    value: string;
}
export interface DateRangeAfterCondition extends BaseCondition {
    operator: 'date-range-after';
    value: string;
}
export interface DateRangeBeforeCondition extends BaseCondition {
    operator: 'date-range-before';
    value: string;
}
export interface DateRangeIncludesCondition extends BaseCondition {
    operator: 'date-range-includes';
    value: string;
}
export interface TimeRangeAfterCondition extends BaseCondition {
    operator: 'time-range-after';
    value: string;
}
export interface TimeRangeBeforeCondition extends BaseCondition {
    operator: 'time-range-before';
    value: string;
}
export interface TimeRangeIncludesCondition extends BaseCondition {
    operator: 'time-range-includes';
    value: string;
}

export interface Matrix1dCellsSelectedCondition extends BaseCondition {
    operator: 'matrix1d-cells-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}
export interface Matrix1dRowsSelectedCondition extends BaseCondition {
    operator: 'matrix1d-rows-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}

export interface Matrix2dColumnsSelectedCondition extends BaseCondition {
    operator: 'matrix2d-columns-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}
export interface Matrix2dRowsSelectedCondition extends BaseCondition {
    operator: 'matrix2d-rows-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}
export interface Matrix2dSubColumnsSelectedCondition extends BaseCondition {
    operator: 'matrix2d-sub-columns-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}
export interface Matrix2dSubRowsSelectedCondition extends BaseCondition {
    operator: 'matrix2d-sub-rows-selected';
    operatorModifier: 'every' | 'some';
    value: string[];
}

export type NumberCondition = EmptyCondition
    | NumberGreaterThanCondition
    | NumberLessThanCondition
    | NumberEqualToCondition;

export type TextCondition = EmptyCondition
    | TextStartsWithCondition
    | TextEndsWithCondition
    | TextContainsCondition;

export type SingleSelectCondition = EmptyCondition
    | SingleSelectSelectedCondition;

export type GeoLocationCondition = EmptyCondition;

export type ScaleCondition = EmptyCondition
    | ScaleSelectedCondition;

export type DateCondition = EmptyCondition
    | DateAfterCondition
    | DateBeforeCondition
    | DateEqualToCondition;

export type TimeCondition = EmptyCondition
    | TimeAfterCondition
    | TimeBeforeCondition
    | TimeEqualToCondition;

export type DateRangeCondition = EmptyCondition
    | DateRangeAfterCondition
    | DateRangeBeforeCondition
    | DateRangeIncludesCondition;

export type TimeRangeCondition = EmptyCondition
    | TimeRangeAfterCondition
    | TimeRangeBeforeCondition
    | TimeRangeIncludesCondition;

export type MultiSelectCondition = EmptyCondition
    | MultiSelectSelectedCondition;

export type OrganigramCondition = EmptyCondition
    | OrganigramSelectedCondition;

export type Matrix1dCondition = EmptyCondition
    | Matrix1dRowsSelectedCondition
    | Matrix1dCellsSelectedCondition;

export type Matrix2dCondition = EmptyCondition
    | Matrix2dColumnsSelectedCondition
    | Matrix2dRowsSelectedCondition
    | Matrix2dSubColumnsSelectedCondition
    | Matrix2dSubRowsSelectedCondition;

export interface NumberConditional extends BaseConditional {
    parentWidgetType: 'NUMBER';
    conditions: NumberCondition[];
}
export interface TextConditional extends BaseConditional {
    parentWidgetType: 'TEXT';
    conditions: TextCondition[];
}
export interface DateConditional extends BaseConditional {
    parentWidgetType: 'DATE';
    conditions: DateCondition[];
}
export interface TimeConditional extends BaseConditional {
    parentWidgetType: 'TIME';
    conditions: TimeCondition[];
}
export interface TimeRangeConditional extends BaseConditional {
    parentWidgetType: 'TIME_RANGE';
    conditions: TimeRangeCondition[];
}
export interface DateRangeConditional extends BaseConditional {
    parentWidgetType: 'DATE_RANGE';
    conditions: DateRangeCondition[];
}
export interface GeoLocationConditional extends BaseConditional {
    parentWidgetType: 'GEO';
    conditions: GeoLocationCondition[];
}
export interface SingleSelectConditional extends BaseConditional {
    parentWidgetType: 'SELECT';
    conditions: SingleSelectCondition[];
}
export interface MultiSelectConditional extends BaseConditional {
    parentWidgetType: 'MULTISELECT';
    conditions: MultiSelectCondition[];
}
export interface Matrix1dConditional extends BaseConditional {
    parentWidgetType: 'MATRIX1D';
    conditions: Matrix1dCondition[];
}
export interface Matrix2dConditional extends BaseConditional {
    parentWidgetType: 'MATRIX2D';
    conditions: Matrix2dCondition[];
}
export interface OrganigramConditional extends BaseConditional {
    parentWidgetType: 'ORGANIGRAM';
    conditions: OrganigramCondition[];
}
export interface ScaleConditional extends BaseConditional {
    parentWidgetType: 'SCALE';
    conditions: ScaleCondition[];
}

type Conditional = NumberConditional
    | TextConditional
    | SingleSelectConditional
    | MultiSelectConditional
    | DateConditional
    | TimeConditional
    | TimeRangeConditional
    | DateRangeConditional
    | Matrix1dConditional
    | Matrix2dConditional
    | OrganigramConditional
    | ScaleConditional
    | GeoLocationConditional;

// NOTE: we are replacing these with more strict types
export type BaseWidget = Omit<WidgetRaw, 'widgetId' | 'properties' | 'widgetIdDisplay' | 'widthDisplay' | 'conditional'> & {
    conditional?: Conditional;
};

interface BaseProperties<T> {
    defaultValue?: T;
}

export interface KeyLabelEntity {
    key: string;
    label: string;
    tooltip?: string;
    order: number;
}

export interface KeyLabelColorEntity extends KeyLabelEntity {
    color: string;
}

export type NumberValue = number;
export type TextValue = string;
export type DateValue = string;
export type TimeValue = string;
export type DateRangeValue = {
    startDate: string | undefined;
    endDate: string | undefined;
};
export type TimeRangeValue = {
    startTime: string | undefined;
    endTime: string | undefined;
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

export interface Matrix2dProperties extends BaseProperties<undefined> {
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

export const TEXT_WIDGET_VERSION = 1;
export const NUMBER_WIDGET_VERSION = 1;
export const TIME_WIDGET_VERSION = 1;
export const DATE_WIDGET_VERSION = 1;
export const TIME_RANGE_WIDGET_VERSION = 1;
export const DATE_RANGE_WIDGET_VERSION = 1;
export const SINGLE_SELECT_WIDGET_VERSION = 1;
export const MULTI_SELECT_WIDGET_VERSION = 1;
export const SCALE_WIDGET_VERSION = 1;
export const ORGANIGRAM_WIDGET_VERSION = 1;
export const GEOLOCATION_WIDGET_VERSION = 1;
export const MATRIX1D_WIDGET_VERSION = 1;
export const MATRIX2D_WIDGET_VERSION = 1;

type BaseFilterType = Omit<AnalysisFrameworkFilterTypeRaw, 'properties' | 'widgetType'>;

export interface KeyLabel {
    key: string;
    label: string;
}

interface BaseFilterProperties<T> {
    type: string;
    options?: T[];
}

interface TextFilterType extends BaseFilterType {
    widgetType: 'TEXT';
    properties?: unknown;
}

interface NumberFilterType extends BaseFilterType {
    widgetType: 'NUMBER';
    properties?: unknown;
}

interface TimeFilterType extends BaseFilterType {
    widgetType: 'TIME';
    properties?: unknown;
}

interface DateFilterType extends BaseFilterType {
    widgetType: 'DATE';
    properties?: unknown;
}

interface TimeRangeFilterType extends BaseFilterType {
    widgetType: 'TIME_RANGE';
    properties?: unknown;
}

interface DateRangeFilterType extends BaseFilterType {
    widgetType: 'DATE_RANGE';
    properties?: unknown;
}

interface SingleSelectFilterType extends BaseFilterType {
    widgetType: 'SELECT';
    properties?: BaseFilterProperties<KeyLabel>;
}

interface MultiSelectFilterType extends BaseFilterType {
    widgetType: 'MULTISELECT';
    properties?: BaseFilterProperties<KeyLabel>;
}

interface ScaleFilterType extends BaseFilterType {
    widgetType: 'SCALE';
    properties?: BaseFilterProperties<KeyLabel>;
}

interface OrganigramFilterType extends BaseFilterType {
    widgetType: 'ORGANIGRAM';
    properties?: BaseFilterProperties<KeyLabel>;
}

interface GeoLocationFilterType extends BaseFilterType {
    widgetType: 'GEO';
    properties?: unknown;
}

interface Matrix1dFilterType extends BaseFilterType {
    widgetType: 'MATRIX1D';
    properties?: BaseFilterProperties<KeyLabel>;
}

interface Matrix2dFilterType extends BaseFilterType {
    widgetType: 'MATRIX2D';
    properties?: BaseFilterProperties<KeyLabel>;
}

export type FrameworkFilterType = TextFilterType
    | NumberFilterType
    | TimeFilterType
    | DateFilterType
    | TimeRangeFilterType
    | DateRangeFilterType
    | SingleSelectFilterType
    | MultiSelectFilterType
    | ScaleFilterType
    | OrganigramFilterType
    | GeoLocationFilterType
    | Matrix1dFilterType
    | Matrix2dFilterType;

interface BaseExportableType {
    id: string;
    inline: boolean;
    order: number;
    widgetKey: string;
    // widgetType
    // data
}

interface TextExportableType extends BaseExportableType {
    widgetType: 'TEXT';
    data?: unknown;
}

interface NumberExportableType extends BaseExportableType {
    widgetType: 'NUMBER';
    data?: unknown;
}

interface TimeExportableType extends BaseExportableType {
    widgetType: 'TIME';
    data?: unknown;
}

interface DateExportableType extends BaseExportableType {
    widgetType: 'DATE';
    data?: unknown;
}

interface TimeRangeExportableType extends BaseExportableType {
    widgetType: 'TIME_RANGE';
    data?: unknown;
}

interface DateRangeExportableType extends BaseExportableType {
    widgetType: 'DATE_RANGE';
    data?: unknown;
}

interface SingleSelectExportableType extends BaseExportableType {
    widgetType: 'SELECT';
    data?: unknown;
}

interface MultiSelectExportableType extends BaseExportableType {
    widgetType: 'MULTISELECT';
    data?: unknown;
}

interface ScaleExportableType extends BaseExportableType {
    widgetType: 'SCALE';
    data?: unknown;
}

interface OrganigramExportableType extends BaseExportableType {
    widgetType: 'ORGANIGRAM';
    data?: unknown;
}

interface GeoLocationExportableType extends BaseExportableType {
    widgetType: 'GEO';
    data?: unknown;
}

// FIXME: rename Level
export interface Level {
    // NOTE: `id` should be `key`
    id: string;
    title: string;
    sublevels?: Level[];
}

interface Matrix1dExportableType extends BaseExportableType {
    widgetType: 'MATRIX1D';
    data?: {
        report: {
            levels: Level[];
        }
    };
}

interface Matrix2dExportableType extends BaseExportableType {
    widgetType: 'MATRIX2D';
    data?: {
        report?: {
            levels: Level[] | undefined;
        }
    };
}

export type FrameworkExportableType = TextExportableType
    | NumberExportableType
    | TimeExportableType
    | DateExportableType
    | TimeRangeExportableType
    | DateRangeExportableType
    | GeoLocationExportableType
    | ScaleExportableType
    | SingleSelectExportableType
    | MultiSelectExportableType
    | OrganigramExportableType
    | Matrix1dExportableType
    | Matrix2dExportableType;

export interface FrameworkProperties {

    stats_config: {
        widget_1d?: { // TODO need to change this to matrix1d later
            pk: number;
        }[];
        widget_2d?: { // // TODO need to change this to matrix2d later
            pk: number;
        }[];

        geo_widget?: {
            pk: number;
        };

        severity_widget?: {
            pk: number;
        };

        reliability_widget?: {
            pk: number;
        };

        affected_groups_widget?: {
            pk: number;
        };

        specific_needs_groups_widgets?: {
            pk: number;
        };
    };
}

const widgetVersionMapping: {
    [key in Widget['widgetId']]: number
} = {
    TEXT: TEXT_WIDGET_VERSION,
    NUMBER: NUMBER_WIDGET_VERSION,
    TIME: TIME_WIDGET_VERSION,
    DATE: DATE_WIDGET_VERSION,
    TIME_RANGE: TIME_RANGE_WIDGET_VERSION,
    DATE_RANGE: DATE_RANGE_WIDGET_VERSION,
    GEO: GEOLOCATION_WIDGET_VERSION,
    SELECT: SINGLE_SELECT_WIDGET_VERSION,
    MULTISELECT: MULTI_SELECT_WIDGET_VERSION,
    SCALE: SCALE_WIDGET_VERSION,
    ORGANIGRAM: ORGANIGRAM_WIDGET_VERSION,
    MATRIX1D: MATRIX1D_WIDGET_VERSION,
    MATRIX2D: MATRIX2D_WIDGET_VERSION,
};
/*
const supportedWidgetTypes: Widget['widgetId'][] = [
    'NUMBER',
    'TEXT',
    'DATE',
    'TIME',
    'DATE_RANGE',
    'TIME_RANGE',
    'GEO',
    'SELECT',
    'MULTISELECT',
    'MATRIX1D',
    'MATRIX2D',
    'ORGANIGRAM',
    'SCALE',
];
*/

export function getWidgetVersion(type: Widget['widgetId']) {
    return widgetVersionMapping[type];
}

function convertDateStringToTimestamp(value: undefined): undefined;
function convertDateStringToTimestamp(value: string): number;
function convertDateStringToTimestamp(value: string | undefined): number | undefined;
function convertDateStringToTimestamp(value: string | undefined) {
    if (!value) {
        return undefined;
    }
    return new Date(value).getTime();
}

function convertTimeStringToSeconds(value: undefined): undefined;
function convertTimeStringToSeconds(value: string): number;
function convertTimeStringToSeconds(value: string | undefined): number | undefined;
function convertTimeStringToSeconds(value: string | undefined) {
    if (!value) {
        return undefined;
    }
    const [hh = '00', mm = '00', ss = '00'] = value.split(':');
    return Number(hh) * 60 * 60 + Number(mm) * 60 + Number(ss);
}

function isEverySelected<T>(options: T[], value: T[]) {
    const optionsSet = new Set(options);
    const valueSet = new Set(value);
    const commonSet = intersection(optionsSet, valueSet);
    return commonSet.size === valueSet.size;
}
function isSomeSelected<T>(options: T[], value: T[]) {
    const optionsSet = new Set(options);
    const valueSet = new Set(value);
    const commonSet = intersection(optionsSet, valueSet);
    return commonSet.size > 0;
}

function validateNumberCondition(
    condition: NumberCondition,
    attribute: PartializeAttribute<NumberWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value);
        case 'number-greater-than':
            return isDefined(value) && value > condition.value;
        case 'number-less-than':
            return isDefined(value) && value < condition.value;
        case 'number-equal-to':
            return isDefined(value) && value === condition.value;
        default:
            return undefined;
    }
}
function validateTextCondition(
    condition: TextCondition,
    attribute: PartializeAttribute<TextWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value.toLowerCase();
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value === '';
        case 'text-starts-with':
            return isDefined(value) && value.startsWith(condition.value.toLowerCase());
        case 'text-ends-with':
            return isDefined(value) && value.endsWith(condition.value.toLowerCase());
        case 'text-contains':
            return isDefined(value) && value.includes(condition.value.toLowerCase());
        default:
            return undefined;
    }
}
function validateDateCondition(
    condition: DateCondition,
    attribute: PartializeAttribute<DateWidgetAttribute> | undefined,
) {
    const value = convertDateStringToTimestamp(attribute?.data?.value);
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value);
        case 'date-after':
            return isDefined(value) && value > convertDateStringToTimestamp(condition.value);
        case 'date-before':
            return isDefined(value) && value < convertDateStringToTimestamp(condition.value);
        case 'date-equal-to':
            return isDefined(value) && value === convertDateStringToTimestamp(condition.value);
        default:
            return undefined;
    }
}
function validateTimeCondition(
    condition: TimeCondition,
    attribute: PartializeAttribute<TimeWidgetAttribute> | undefined,
) {
    const value = convertTimeStringToSeconds(attribute?.data?.value);
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value);
        case 'time-after':
            return isDefined(value) && value > convertTimeStringToSeconds(condition.value);
        case 'time-before':
            return isDefined(value) && value < convertTimeStringToSeconds(condition.value);
        case 'time-equal-to':
            return isDefined(value) && value === convertTimeStringToSeconds(condition.value);
        default:
            return undefined;
    }
}
function validateDateRangeCondition(
    condition: DateRangeCondition,
    attribute: PartializeAttribute<DateRangeWidgetAttribute> | undefined,
) {
    const startValue = convertDateStringToTimestamp(attribute?.data?.value?.startDate);
    const endValue = convertDateStringToTimestamp(attribute?.data?.value?.endDate);
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(startValue) && isNotDefined(endValue);
        case 'date-range-after':
            return isDefined(startValue)
                && startValue > convertDateStringToTimestamp(condition.value);
        case 'date-range-before':
            return isDefined(endValue)
                && endValue < convertDateStringToTimestamp(condition.value);
        case 'date-range-includes':
            return isDefined(startValue)
                && isDefined(endValue)
                && endValue >= convertDateStringToTimestamp(condition.value)
                && startValue <= convertDateStringToTimestamp(condition.value);
        default:
            return undefined;
    }
}
function validateTimeRangeCondition(
    condition: TimeRangeCondition,
    attribute: PartializeAttribute<TimeRangeWidgetAttribute> | undefined,
) {
    const startValue = convertTimeStringToSeconds(attribute?.data?.value?.startTime);
    const endValue = convertTimeStringToSeconds(attribute?.data?.value?.endTime);
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(startValue) && isNotDefined(endValue);
        case 'time-range-after':
            return isDefined(startValue)
                && startValue > convertTimeStringToSeconds(condition.value);
        case 'time-range-before':
            return isDefined(endValue)
                && endValue < convertTimeStringToSeconds(condition.value);
        case 'time-range-includes':
            return isDefined(startValue)
                && isDefined(endValue)
                && endValue >= convertTimeStringToSeconds(condition.value)
                && startValue <= convertTimeStringToSeconds(condition.value);
        default:
            return undefined;
    }
}
function validateGeoLocationCondition(
    condition: GeoLocationCondition,
    attribute: PartializeAttribute<GeoLocationWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value.length <= 0;
        default:
            return undefined;
    }
}
function validateScaleCondition(
    condition: ScaleCondition,
    attribute: PartializeAttribute<ScaleWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value.length <= 0;
        case 'scale-selected':
            return isDefined(value) && condition.value.includes(value);
        default:
            return undefined;
    }
}
function validateSingleSelectCondition(
    condition: SingleSelectCondition,
    attribute: PartializeAttribute<SingleSelectWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value.length <= 0;
        case 'single-selection-selected':
            return isDefined(value) && condition.value.includes(value);
        default:
            return undefined;
    }
}
function validateMultiSelectCondition(
    condition: MultiSelectCondition,
    attribute: PartializeAttribute<MultiSelectWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value.length <= 0;
        case 'multi-selection-selected':
            return isDefined(value) && (
                condition.operatorModifier === 'every'
                    ? isEverySelected(value, condition.value)
                    : isSomeSelected(value, condition.value)
            );
        default:
            return undefined;
    }
}
function validateMatrix1dCondition(
    condition: Matrix1dCondition,
    attribute: PartializeAttribute<Matrix1dWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value);
        case 'matrix1d-rows-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = Object.keys(value);
            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        case 'matrix1d-cells-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = mapToList(
                value,
                (item) => item,
            ).flatMap((item) => (item ? Object.keys(item) : []));
            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        default:
            return undefined;
    }
}
function validateMatrix2dCondition(
    condition: Matrix2dCondition,
    attribute: PartializeAttribute<Matrix2dWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value);
        case 'matrix2d-rows-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = Object.keys(value);
            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        case 'matrix2d-sub-rows-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = mapToList(value)
                .filter(isDefined)
                .flatMap((val) => Object.keys(val));
            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        case 'matrix2d-columns-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = mapToList(value)
                .filter(isDefined)
                .flatMap((val) => mapToList(val))
                .filter(isDefined)
                .flatMap((val) => Object.keys(val));

            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        case 'matrix2d-sub-columns-selected': {
            if (isNotDefined(value)) {
                return false;
            }
            const rowsValue = mapToList(value)
                .filter(isDefined)
                .flatMap((val) => mapToList(val))
                .filter(isDefined)
                .flatMap((val) => mapToList(val))
                .filter(isDefined)
                .flat();

            return (
                condition.operatorModifier === 'every'
                    ? isEverySelected(rowsValue, condition.value)
                    : isSomeSelected(rowsValue, condition.value)
            );
        }
        default:
            return undefined;
    }
}
function validateOrganigramCondition(
    condition: OrganigramCondition,
    attribute: PartializeAttribute<OrganigramWidgetAttribute> | undefined,
) {
    const value = attribute?.data?.value;
    switch (condition.operator) {
        case 'empty':
            return isNotDefined(value) || value.length <= 0;
        case 'organigram-selected':
            return isDefined(value) && (
                condition.operatorModifier === 'every'
                    ? isEverySelected(value, condition.value)
                    : isSomeSelected(value, condition.value)
            );
        default:
            return undefined;
    }
}

function validateFirstCondition(
    conditional: Conditional,
    attribute: PartialWidgetAttribute | undefined,
): boolean {
    // If there is no condition, the child widget is always valid
    if (!conditional.conditions[0]) {
        return true;
    }

    // NOTE: invertBoolean will treat 'undefined' as false and will not be inverted
    if (conditional.parentWidgetType === 'NUMBER' && (!attribute || attribute.widgetType === 'NUMBER')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateNumberCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'TEXT' && (!attribute || attribute.widgetType === 'TEXT')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateTextCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'DATE' && 'DATE' && (!attribute || attribute.widgetType === 'DATE')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateDateCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'TIME' && 'TIME' && (!attribute || attribute.widgetType === 'TIME')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateTimeCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'DATE_RANGE' && 'DATE_RANGE' && (!attribute || attribute.widgetType === 'DATE_RANGE')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateDateRangeCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'TIME_RANGE' && (!attribute || attribute.widgetType === 'TIME_RANGE')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateTimeRangeCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'GEO' && (!attribute || attribute.widgetType === 'GEO')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateGeoLocationCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'SELECT' && (!attribute || attribute.widgetType === 'SELECT')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateSingleSelectCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'MULTISELECT' && (!attribute || attribute.widgetType === 'MULTISELECT')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateMultiSelectCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'MATRIX1D' && (!attribute || attribute.widgetType === 'MATRIX1D')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateMatrix1dCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'MATRIX2D' && (!attribute || attribute.widgetType === 'MATRIX2D')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateMatrix2dCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'SCALE' && (!attribute || attribute.widgetType === 'SCALE')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateScaleCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }
    if (conditional.parentWidgetType === 'ORGANIGRAM' && (!attribute || attribute.widgetType === 'ORGANIGRAM')) {
        const firstCondition = conditional.conditions[0];
        return invertBoolean(
            validateOrganigramCondition(firstCondition, attribute),
            firstCondition.invert,
        );
    }

    // If there is not parentWidgetType or attribute doesn't match,
    // the child widget is always invalid
    return false;
}

function validateConditions(
    conditional: Conditional,
    attribute: PartialWidgetAttribute | undefined,
): boolean {
    const firstConditionValue = validateFirstCondition(conditional, attribute);
    if (conditional.conditions.length <= 1) {
        return firstConditionValue;
    }

    const [firstCondition, ...otherConditions] = conditional.conditions;
    const otherConditionValue = validateConditions(
        { ...conditional, conditions: otherConditions } as Conditional,
        attribute,
    );
    switch (firstCondition.conjunctionOperator) {
        case 'XOR':
            return (firstConditionValue && !otherConditionValue)
                || (!firstConditionValue && otherConditionValue);
        case 'OR':
            return firstConditionValue || otherConditionValue;
        case 'AND':
            return firstConditionValue && otherConditionValue;
        default:
            return firstConditionValue && otherConditionValue;
    }
}

export function getHiddenWidgetIds(
    widgets: Widget[],
    attributes: PartialWidgetAttribute[],
) {
    /*
    const supportedWidgets = widgets.filter((widget) => {
        // Filter out un-supported widgets
        if (!supportedWidgetTypes.includes(widget.widgetId)) {
            return false;
        }
        // Filter out out-of-date widgets
        if (widget.version != getWidgetVersion(widget.widgetId)) {
            return false;
        }
        return true;
    });

    const parentWidgets = listToMap(
        supportedWidgets,
        (widget) => widget.id,
        (widget) => widget,
    );
    */
    const parentAttributes = listToMap(
        attributes,
        (attribute) => attribute.widget,
        (attribute) => attribute,
    );

    const widgetsToHide = widgets.filter((widget) => {
        // All widgets without conditional are non-conditional widgets
        if (!widget.conditional) {
            return false;
        }
        // FIXME: make parentWidget mandatory
        // All conditional widgets should have parentId
        const parentId = widget.conditional.parentWidget;
        if (!parentId) {
            return true;
        }
        const value: PartialWidgetAttribute | undefined = parentAttributes[parentId];
        /*
        // All conditional widgets should have parentWidget
        const parentWidget = parentWidgets[parentId];
        if (!parentWidget) {
            return false;
        }
        // Clearing out value if version does not match
        let value: WidgetAttribute | undefined = parentAttributes[parentId];
        if (value.widgetVersion !== parentWidget.version) {
            value = undefined;
        }
       */

        return !validateConditions(widget.conditional, value);
    });

    return listToMap(
        widgetsToHide,
        (item) => item.id,
        () => true,
    );
}

export interface AssistedTag {
    id: string;
    label: string; // Example: 'Context'
    labelGroup: string; // Example: 'Context Group 1'
}

export const mockAssistedTags = [
    {
        id: '1',
        label: 'Agriculture',
        labelGroup: 'Sectors',
    },
    {
        id: '2',
        label: 'Cross',
        labelGroup: 'Sectors',
    },
    {
        id: '3',
        label: 'Education',
        labelGroup: 'Sectors',
    },
    {
        id: '4',
        label: 'Food Security',
        labelGroup: 'Sectors',
    },
    {
        id: '5',
        label: 'Health',
        labelGroup: 'Sectors',
    },
    {
        id: '6',
        label: 'Critical',
        labelGroup: 'Severity',
    },
    {
        id: '7',
        label: 'Major',
        labelGroup: 'Severity',
    },
    {
        id: '8',
        label: 'Minor Problem',
        labelGroup: 'Severity',
    },
    {
        id: '9',
        label: 'No Problem',
        labelGroup: 'Severity',
    },
    {
        id: '10',
        label: 'Of Concern',
        labelGroup: 'Severity',
    },
    {
        id: '11',
        label: 'Environment',
        labelGroup: 'Context',
    },
    {
        id: '12',
        label: 'Socio Cultural',
        labelGroup: 'Context',
    },
    {
        id: '13',
        label: 'Economy',
        labelGroup: 'Context',
    },
    {
        id: '14',
        label: 'Demography',
        labelGroup: 'Context',
    },
    {
        id: '15',
        label: 'Legal and Policy',
        labelGroup: 'Context',
    },
    {
        id: '16',
        label: 'Security and Stability',
        labelGroup: 'Context',
    },
    {
        id: '17',
        label: 'Politics',
        labelGroup: 'Context',
    },
    {
        id: '18',
        label: 'Type and Characteristics',
        labelGroup: 'Shock and Event',
    },
    {
        id: '19',
        label: 'Underlying Aggravating Factors',
        labelGroup: 'Shock and Event',
    },
    {
        id: '20',
        label: 'Hazard Threats',
        labelGroup: 'Shock and Event',
    },
];

interface MappingItemBase {
    tagId: string; // NOTE: AssistedTag['id'];
    widgetId: string;
}

export interface Matrix1dMappingItem extends MappingItemBase {
    widgetType: 'MATRIX1D';
    mapping: {
        rowKey: string;
        subRowKey: string;
    }
}

export interface Matrix2dMappingItem extends MappingItemBase {
    widgetType: 'MATRIX2D';
    mapping: {
        type: 'SUB_ROW';
        rowKey: string;
        subRowKey: string;
    } | {
        type: 'COLUMN';
        columnKey: string;
    } | {
        type: 'SUB_COLUMN';
        columnKey: string;
        subColumnKey: string;
    };
}

export interface ScaleMappingItem extends MappingItemBase {
    widgetType: 'SCALE';
    mapping: {
        optionKey: string;
    };
}

export interface SelectMappingItem extends MappingItemBase {
    widgetType: 'SELECT';
    mapping: {
        optionKey: string;
    };
}

export interface MultiSelectMappingItem extends MappingItemBase {
    widgetType: 'MULTISELECT';
    mapping: {
        optionKey: string;
    };
}

export interface OrganigramMappingItem extends MappingItemBase {
    widgetType: 'ORGANIGRAM';
    mapping: {
        optionKey: string;
    };
}

export type MappingItem = Matrix1dMappingItem
    | Matrix2dMappingItem
    | ScaleMappingItem
    | SelectMappingItem
    | MultiSelectMappingItem
    | OrganigramMappingItem;
