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
    Types,
} from './newAnalyticalFramework';

interface BaseWidgetValue {
    id: string;
    type: Types;
}

interface BaseValue<T> {
    value: T;
}

export interface TextWidgetValue extends BaseWidgetValue {
    type: 'TEXTWIDGET';
    data: BaseValue<TextValue>;
}

export interface NumberWidgetValue extends BaseWidgetValue {
    type: 'NUMBERWIDGET';
    data: BaseValue<NumberValue>;
}

export interface TimeWidgetValue extends BaseWidgetValue {
    type: 'TIMEWIDGET';
    data: BaseValue<TimeValue>;
}

export interface DateWidgetValue extends BaseWidgetValue {
    type: 'DATEWIDGET';
    data: BaseValue<DateValue>;
}

export interface TimeRangeWidgetValue extends BaseWidgetValue {
    type: 'TIMERANGEWIDGET';
    data: BaseValue<TimeRangeValue>;
}

export interface DateRangeWidgetValue extends BaseWidgetValue {
    type: 'DATERANGEWIDGET';
    data: BaseValue<DateRangeValue>;
}

export interface SingleSelectWidgetValue extends BaseWidgetValue {
    type: 'SELECTWIDGET';
    data: BaseValue<SingleSelectValue>;
}

export interface MultiSelectWidgetValue extends BaseWidgetValue {
    type: 'MULTISELECTWIDGET';
    data: BaseValue<MultiSelectValue>;
}

export interface ScaleWidgetValue extends BaseWidgetValue {
    type: 'SCALEWIDGET';
    data: BaseValue<ScaleValue>;
}

export interface OrganigramWidgetValue extends BaseWidgetValue {
    type: 'ORGANIGRAMWIDGET';
    data: BaseValue<OrganigramValue>;
}

export interface GeoLocationWidgetValue extends BaseWidgetValue {
    type: 'GEOWIDGET';
    data: BaseValue<GeoLocationValue>;
}

export interface Matrix1dWidgetValue extends BaseWidgetValue {
    type: 'MATRIX1DWIDGET';
    data: BaseValue<Matrix1dValue>;
}

export interface Matrix2dWidgetValue extends BaseWidgetValue {
    type: 'MATRIX2DWIDGET';
    data: BaseValue<Matrix2dValue>;
}

export type WidgetValue = TextWidgetValue
    | NumberWidgetValue
    | TimeWidgetValue
    | DateWidgetValue
    | TimeRangeWidgetValue
    | DateRangeWidgetValue
    | SingleSelectWidgetValue
    | MultiSelectWidgetValue
    | ScaleWidgetValue
    | OrganigramWidgetValue
    | GeoLocationWidgetValue
    | Matrix1dWidgetValue
    | Matrix2dWidgetValue

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
    lead: number;
    controlled: boolean;
    entryType: EntryType;

    analyticalFramework: number;
    attributes: WidgetValue[];

    verificationLastChangedByDetails?: UserFields;

    excerpt?: string;
    droppedExcerpt?: string;

    // Labels for entry groups
    projectLabels?: string[];

    // Data for image type entry
    image?: number;
    imageRaw?: string;
    imageDetails?: {
        id: number;
        file: string;
    };

    // Data for dataSeries type entry
    tabularField?: number;
    tabularFieldData?: TabularDataFields;
    verifiedBy: number[];
}

export interface EntryReviewComment {
    id: number;
    textHistory: string[];
    lead: number;
    createdByDetails: {
        id: number;
        name: string;
        email: string;
        organization: string;
        displayPictureUrl: string;
    };
    mentionedusersDetails: {
        id: number;
        name: string;
        email: string;
        organization: string;
        displayPictureUrl: string;
    }[];
    commentTypeDisplay: string;
    createdAt: string;
    commentType: number;
    createdBy: number;
    entry: number;
    mentionedUsers: number[];
}
