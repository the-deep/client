import {
    ProjectFrameworkQuery,
    WidgetType as WidgetRaw,
} from '#generated/types';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';
import { Widget as WidgetFromAF } from '#types/newAnalyticalFramework';

type Project = NonNullable<ProjectFrameworkQuery['project']>;

export type Entry = NonNullable<NonNullable<NonNullable<Project['lead']>['entries']>[number]>;

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<Project['analysisFramework']>, 'key'>;
export type Framework = DeepReplace<FrameworkRaw, WidgetRaw, WidgetFromAF>;
export type Section = NonNullable<Framework['primaryTagging']>[number];
export type Widget = WidgetFromAF;
