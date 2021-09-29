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

/*
// FIXME: remove this after all the other entry related components are
// fixed. Keeping this for reference purpose only

export type EntryType = 'excerpt' | 'image' | 'dataSeries';

export interface Entity {
    id: number;
    createdAt: string;
    createdBy: number;
    createdByName: string;
    modifiedBy: number;
    modifiedByName: string;
    clientId: string;
    versionId: number;
}

export interface TabularDataFields {
    cache: {
        healthStatus: {
            empty: number;
            total: number;
            invalid: number;
        };
        imageStatus: string;
        images: {
            id: number;
            format: string;
            chartType: string;
        }[];
        status: string;
        series: {
            value: string | number;
            count: number;
        };
    };
}

export interface UserFields {
    id: number;
    displayName: string;
    email: string;
}

export interface Entry extends Entity {
    project: number;
    lead: {
        id: number;
        title: string;
        createdAt: string;
        publishedOn: string;
        createdByName: string;
        authorsDetail: {
            title: string;
        }[];
        sourceDetail: {
            title: string;
        };
    };
    controlled: boolean;
    entryType: EntryType;

    analyticalFramework: number;
    attributes: WidgetAttribute[];

    verificationLastChangedByDetails?: UserFields;

    excerpt?: string;
    droppedExcerpt?: string;

    // Labels for entry groups
    projectLabels?: string[];

    // Data for image widgetType entry
    image?: number;
    imageRaw?: string;
    imageDetails?: {
        id: number;
        file: string;
    };

    // Data for dataSeries widgetType entry
    tabularField?: number;
    tabularFieldData?: TabularDataFields;
    verifiedBy: number[];
}
*/
