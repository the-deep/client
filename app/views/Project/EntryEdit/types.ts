import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    ProjectFrameworkQuery,
    WidgetType as WidgetRaw,
    BulkEntryInputType,
    AttributeType as WidgetAttributeRaw,
    AttributeGqInputType as WidgetInputAttributeRaw,
} from '#generated/types';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import { WidgetAttribute as WidgetAttributeFromEntry } from '#types/newEntry';
import { Widget as WidgetFromAF } from '#types/newAnalyticalFramework';

type Project = NonNullable<ProjectFrameworkQuery['project']>;

export type EntryRaw = NonNullable<NonNullable<NonNullable<Project['lead']>['entries']>[number]>;
export type Entry = DeepReplace<EntryRaw, Omit<WidgetAttributeRaw, 'widgetTypeDisplay' | 'widthTypeDisplay'>, WidgetAttributeFromEntry>;

export type EntryInputRaw = DeepMandatory<PurgeNull<BulkEntryInputType>, 'clientId' | 'entryType'>;

// eslint-disable-next-line max-len
export type EntryInput = DeepReplace<EntryInputRaw, WidgetInputAttributeRaw, WidgetAttributeFromEntry> & {
    // NOTE: we track stale information using this value
    stale?: boolean;
    deleted?: boolean;
};

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<Project['analysisFramework']>, 'key'>;
export type Framework = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;
export type Section = NonNullable<Framework['primaryTagging']>[number];
export type Widget = WidgetFromAF;
