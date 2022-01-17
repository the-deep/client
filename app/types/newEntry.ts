import {
    TextValue,
    NumberValue,
    TimeValue,
    DateValue,
    TimeRangeValue,
    DateRangeValue,
    SingleSelectValue,
    MultiSelectValue,
    ScaleValue,
    OrganigramValue,
    GeoLocationValue,
    Matrix1dValue,
    Matrix2dValue,
} from '#types/newAnalyticalFramework';
import {
    // NOTE: Taking AttributeType instead of AttributeInputType
    AttributeType as WidgetAttributeRaw,
} from '#generated/types';

type BaseWidgetAttribute = Omit<WidgetAttributeRaw, 'data' | 'widgetTypeDisplay' | 'widthTypeDisplay'>;

type BaseData<T> = { value: T; } | undefined;

export interface TextWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TEXT';
    data: BaseData<TextValue>;
}

export interface NumberWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'NUMBER';
    data: BaseData<NumberValue>;
}

export interface TimeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TIME';
    data: BaseData<TimeValue>;
}

export interface DateWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'DATE';
    data: BaseData<DateValue>;
}

export interface TimeRangeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TIME_RANGE';
    data: BaseData<TimeRangeValue>;
}

export interface DateRangeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'DATE_RANGE';
    data: BaseData<DateRangeValue>;
}

export interface SingleSelectWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'SELECT';
    data: BaseData<SingleSelectValue>;
}

export interface MultiSelectWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MULTISELECT';
    data: BaseData<MultiSelectValue>;
}

export interface ScaleWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'SCALE';
    data: BaseData<ScaleValue>;
}

export interface OrganigramWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'ORGANIGRAM';
    data: BaseData<OrganigramValue>;
}

export interface GeoLocationWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'GEO';
    data: BaseData<GeoLocationValue>;
}

export interface Matrix1dWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MATRIX1D';
    data: BaseData<Matrix1dValue>;
}

export interface Matrix2dWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MATRIX2D';
    data: BaseData<Matrix2dValue>;
}

export type WidgetAttribute = TextWidgetAttribute
    | NumberWidgetAttribute
    | TimeWidgetAttribute
    | DateWidgetAttribute
    | TimeRangeWidgetAttribute
    | DateRangeWidgetAttribute
    | SingleSelectWidgetAttribute
    | MultiSelectWidgetAttribute
    | ScaleWidgetAttribute
    | OrganigramWidgetAttribute
    | GeoLocationWidgetAttribute
    | Matrix1dWidgetAttribute
    | Matrix2dWidgetAttribute
