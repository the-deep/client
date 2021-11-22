import {
    // NOTE: Taking WidgetType instead of WidgetInputType
    WidgetType as WidgetRaw,
    WidgetWidgetTypeEnum as WidgetTypes,
    AnalysisFrameworkFilterType as AnalysisFrameworkFilterTypeRaw,
} from '#generated/types';

export type Types = WidgetTypes;

type Conjunction = 'XOR' | 'OR' | 'AND' | 'NOR' | 'NAND' | 'NXOR';

interface BaseCondition {
    key: string;
    conjunctionOperator: Conjunction;
    order: number;
    invert: boolean;
}

interface BaseConditional {
    id: string;
    clientId: string;

    // id of parent widget
    parentId: string;
}

type NumberCondition = BaseCondition & ({
    operator: 'greater-than';
    value: number;
} | {
    operator: 'less-than';
    value: number;
} | {
    operator: 'equal-to';
    value: number;
} | {
    operator: 'empty';
});

type TextCondition = BaseCondition & ({
    operator: 'starts-with';
    value: string;
} | {
    operator: 'ends-with';
    value: string;
} | {
    operator: 'contains';
    value: string;
} | {
    operator: 'empty';
});

// NOTE: single select doesn't need to implement array-every-selected as it is
// not possible in most cases
type SelectCondition = BaseCondition & ({
    operator: 'one-selected';
    value: string;
} | {
    operator: 'some-selected';
    value: string[];
} | {
    operator: 'every-selected';
    value: string[];
} | {
    operator: 'empty';
});

// NOTE: we can add array selections here
type OrganigramCondition = BaseCondition & ({
    operator: 'one-selected';
    value: string;
} | {
    operator: 'some-descendent-selected';
    value: string;
} | {
    operator: 'empty';
});

type ScaleCondition = BaseCondition & ({
    operator: 'equal-to';
    value: string;
} | {
    operator: 'at-least';
    value: string;
} | {
    operator: 'at-most';
    value: string;
} | {
    operator: 'empty';
});

type Matrix1dCondition = BaseCondition & ({
    operator: 'some-cell-selected';
    value: string[];
} | {
    operator: 'some-row-selected';
    value: string[];
});

type Matrix2dCondition = BaseCondition & ({
    operator: 'some-row-selected';
    value: string[];
} | {
    operator: 'some-sub-row-selected';
    value: string[];
} | {
    operator: 'some-column-selected';
    value: string[];
} | {
    operator: 'some-sub-column-selected';
    value: string[];
});

type DateCondition = BaseCondition & ({
    operator: 'after';
    value: string;
} | {
    operator: 'before';
    value: string;
} | {
    operator: 'equal-to';
    value: string;
} | {
    operator: 'empty';
});

type TimeCondition = BaseCondition & ({
    operator: 'after';
    value: string;
} | {
    operator: 'before';
    value: string;
} | {
    operator: 'equal-to';
    value: string;
} | {
    operator: 'empty';
});

type DateRangeCondition = BaseCondition & ({
    operator: 'after';
    value: string;
} | {
    operator: 'before';
    value: string;
} | {
    operator: 'includes';
    value: string;
} | {
    operator: 'empty';
})

type TimeRangeCondition = BaseCondition & ({
    operator: 'after';
    value: string;
} | {
    operator: 'before';
    value: string;
} | {
    operator: 'includes';
    value: string;
} | {
    operator: 'empty';
})

export interface NumberConditional extends BaseConditional {
    parentWidgetId: 'NUMBER';
    conditions: NumberCondition[];
}
export interface TextConditional extends BaseConditional {
    parentWidgetId: 'TEXT';
    conditions: TextCondition[];
}
export interface SingleSelectConditional extends BaseConditional {
    parentWidgetId: 'SELECT';
    conditions: SelectCondition[];
}
export interface MultiSelectConditional extends BaseConditional {
    parentWidgetId: 'MULTISELECT';
    conditions: SelectCondition[];
}
export interface DateConditional extends BaseConditional {
    parentWidgetId: 'DATE';
    conditions: DateCondition[];
}
export interface TimeConditional extends BaseConditional {
    parentWidgetId: 'TIME';
    conditions: TimeCondition[];
}
export interface TimeRangeConditional extends BaseConditional {
    parentWidgetId: 'TIME_RANGE';
    conditions: TimeRangeCondition[];
}
export interface DateRangeConditional extends BaseConditional {
    parentWidgetId: 'DATE_RANGE';
    conditions: DateRangeCondition[];
}
export interface Matrix1dConditional extends BaseConditional {
    parentWidgetId: 'MATRIX1D';
    conditions: Matrix1dCondition[];
}
export interface Matrix2dConditional extends BaseConditional {
    parentWidgetId: 'MATRIX2D';
    conditions: Matrix2dCondition[];
}
export interface OrganigramConditional extends BaseConditional {
    parentWidgetId: 'ORGANIGRAM';
    conditions: OrganigramCondition[];
}
export interface ScaleConditional extends BaseConditional {
    parentWidgetId: 'SCALE';
    conditions: ScaleCondition[];
}
export interface GeoLocationConditional extends BaseConditional {
    parentWidgetId: 'GEO';
    conditions: SelectCondition[];
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
export type BaseWidget = Omit<WidgetRaw, 'widgetId' | 'properties' | 'widgetIdDisplay' | 'widthDisplay'> & {
    conditional?: Conditional | undefined;
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
    | SingleSelectExportableType
    | MultiSelectExportableType
    | ScaleExportableType
    | OrganigramExportableType
    | GeoLocationExportableType
    | Matrix1dExportableType
    | Matrix2dExportableType;

export interface FrameworkProperties {
    // eslint-disable-next-line camelcase
    stats_config: {
        matrix1d?: {
            pk: number;
        }[];
        matrix2d?: {
            pk: number;
        }[];
        // eslint-disable-next-line camelcase
        geo_widget?: {
            pk: number;
        };
        // eslint-disable-next-line camelcase
        severity_widget?: {
            pk: number;
        };
        // eslint-disable-next-line camelcase
        reliability_widget?: {
            pk: number;
        };
        // eslint-disable-next-line camelcase
        affected_groups_widget?: {
            pk: number;
        };
        // eslint-disable-next-line camelcase
        specific_needs_groups_widgets?: {
            pk: number;
        };
    };
}
