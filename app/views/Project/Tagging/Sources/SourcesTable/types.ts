import {
    LeadEntriesQuery,
    WidgetType as WidgetRaw,
    AttributeType as WidgetAttributeRaw,
} from '#generated/types';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import { WidgetAttribute as WidgetAttributeFromEntry } from '#types/newEntry';
import { Widget as WidgetFromAF } from '#types/newAnalyticalFramework';

type Project = NonNullable<LeadEntriesQuery['project']>;

export type EntryRaw = NonNullable<NonNullable<NonNullable<Project['entries']>['results']>[number]>;
export type Entry = DeepReplace<EntryRaw, WidgetAttributeRaw, WidgetAttributeFromEntry>;

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<Project['analysisFramework']>, 'key'>;
export type Framework = DeepReplace<FrameworkRaw, WidgetRaw, WidgetFromAF>;
