import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    // Let's define fragments and use that instead of using this query
    EntryResponseFragment,
    FrameworkResponseFragment,

    WidgetType as WidgetRaw,
    BulkEntryInputType,
    AnalysisFrameworkPredictionMappingType as MappingsItemRaw,
    AttributeType as WidgetAttributeRaw,
    AttributeGqInputType as WidgetInputAttributeRaw,
} from '#generated/types';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import { WidgetAttribute as WidgetAttributeFromEntry } from '#types/newEntry';
import {
    Widget as WidgetFromAF,
    MappingsItem,
} from '#types/newAnalyticalFramework';

export type EntryRaw = EntryResponseFragment;
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
export type FrameworkRaw = DeepMandatory<FrameworkResponseFragment, 'key'>;
export type FrameworkWithWidgets = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;
export type Framework = DeepReplace<FrameworkWithWidgets, MappingsItemRaw, MappingsItem>;
export type Section = NonNullable<Framework['primaryTagging']>[number];
export type Widget = WidgetFromAF;
