import {
    ProjectLeadsQuery,
} from '#generated/types';

/*
export type EntryRaw = NonNullable<NonNullable<NonNullable<Project['entries']>['results']>[number]>;
export type Entry = DeepReplace<EntryRaw, Omit<WidgetAttributeRaw, 'widgetTypeDisplay' | 'widthTypeDisplay'>, WidgetAttributeFromEntry>;

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<Project['analysisFramework']>, 'key'>;
export type Framework = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;
*/
type Project = NonNullable<ProjectLeadsQuery['project']>;

export type Lead = NonNullable<NonNullable<NonNullable<Project['leads']>['results']>[number]>;
