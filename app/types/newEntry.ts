import {
    PurgeNull,
} from '@togglecorp/toggle-form';
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
    DeepMandatory,
    DeepReplace,
} from '#types/newAnalyticalFramework';
import {
    BulkEntryInputType,
    ProjectFrameworkQuery,
} from '#generated/types';

export type EntryRaw = NonNullable<NonNullable<NonNullable<NonNullable<ProjectFrameworkQuery['project']>['lead']>['entries']>[number]>;
export type EntryInputRaw = DeepMandatory<PurgeNull<BulkEntryInputType>, 'clientId' | 'widgetType' | 'lead' | 'entryType'>;

type WidgetAttributeRaw = NonNullable<BulkEntryInputType['attributes']>[number];
type BaseWidgetAttribute = Omit<WidgetAttributeRaw, 'data' | 'widgetType'>;

type BaseData<T> = { value: T; } | undefined;

export interface TextWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TEXTWIDGET';
    data: BaseData<TextValue>;
}

export interface NumberWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'NUMBERWIDGET';
    data: BaseData<NumberValue>;
}

export interface TimeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TIMEWIDGET';
    data: BaseData<TimeValue>;
}

export interface DateWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'DATEWIDGET';
    data: BaseData<DateValue>;
}

export interface TimeRangeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'TIMERANGEWIDGET';
    data: BaseData<TimeRangeValue>;
}

export interface DateRangeWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'DATERANGEWIDGET';
    data: BaseData<DateRangeValue>;
}

export interface SingleSelectWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'SELECTWIDGET';
    data: BaseData<SingleSelectValue>;
}

export interface MultiSelectWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MULTISELECTWIDGET';
    data: BaseData<MultiSelectValue>;
}

export interface ScaleWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'SCALEWIDGET';
    data: BaseData<ScaleValue>;
}

export interface OrganigramWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'ORGANIGRAMWIDGET';
    data: BaseData<OrganigramValue>;
}

export interface GeoLocationWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'GEOWIDGET';
    data: BaseData<GeoLocationValue>;
}

export interface Matrix1dWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MATRIX1DWIDGET';
    data: BaseData<Matrix1dValue>;
}

export interface Matrix2dWidgetAttribute extends BaseWidgetAttribute {
    widgetType: 'MATRIX2DWIDGET';
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

export type Entry = DeepReplace<EntryRaw, WidgetAttributeRaw, WidgetAttribute>;
export type EntryInput = DeepReplace<EntryInputRaw, WidgetAttributeRaw, WidgetAttribute>;

/*
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
    mentionedUsersDetails: {
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
*/
