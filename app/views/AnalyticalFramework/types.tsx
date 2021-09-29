import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    WidgetType as WidgetRaw,
    WidgetGqlInputType as WidgetInputRaw,
    CurrentFrameworkQuery,
    AnalysisFrameworkInputType,
} from '#generated/types';
import { Widget as WidgetFromAF } from '#types/newAnalyticalFramework';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<CurrentFrameworkQuery['analysisFramework']>, 'key'>;
export type Framework = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;

export type FrameworkInputRaw = DeepMandatory<PurgeNull<AnalysisFrameworkInputType>, 'clientId' | 'key' | 'widgetId' | 'order'>;
export type FrameworkInput = DeepReplace<FrameworkInputRaw, WidgetInputRaw, WidgetFromAF>;
export type Section = NonNullable<NonNullable<FrameworkInput['primaryTagging']>[number]>;
export type Widget = WidgetFromAF;
