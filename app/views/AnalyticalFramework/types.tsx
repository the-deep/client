import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    WidgetType as WidgetRaw,
    WidgetGqlInputType as WidgetInputRaw,
    CurrentFrameworkQuery,
    AnalysisFrameworkInputType,
} from '#generated/types';
import {
    Widget as WidgetFromAF,
    FrameworkProperties,
} from '#types/newAnalyticalFramework';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<CurrentFrameworkQuery['analysisFramework']>, 'key'>;
type FrameworkWithWidgets = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;
export type Framework = Omit<FrameworkWithWidgets, 'properties'> & { properties?: FrameworkProperties };

export type FrameworkInputRaw = DeepMandatory<PurgeNull<AnalysisFrameworkInputType>, 'clientId' | 'key' | 'widgetId' | 'order'>;
type FrameworkInputWithWidgets = DeepReplace<FrameworkInputRaw, WidgetInputRaw, WidgetFromAF>;
export type FrameworkInput = Omit<FrameworkInputWithWidgets, 'properties' | 'previewImage'> & {
    properties?: FrameworkProperties,
    previewImage?: File | null,
};
export type Section = NonNullable<NonNullable<FrameworkInput['primaryTagging']>[number]>;
export type Widget = WidgetFromAF;
