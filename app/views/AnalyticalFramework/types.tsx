import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    WidgetType as WidgetRaw,
    AnalysisFrameworkPredictionMappingType as MappingsItemRaw,
    WidgetGqlInputType as WidgetInputRaw,
    PredictionTagAnalysisFrameworkMapInputType as MappingsItemInputRaw,
    CurrentFrameworkQuery,
    AnalysisFrameworkInputType,
} from '#generated/types';
import {
    Widget as WidgetFromAF,
    FrameworkProperties,
    MappingsItem,
} from '#types/newAnalyticalFramework';
import {
    DeepMandatory,
    DeepReplace,
} from '#utils/types';

// FIXME: 'key' is thought to be mandatory from server.
// Remove this DeepMandatory transformation after server sends key as mandatory
export type FrameworkRaw = DeepMandatory<NonNullable<CurrentFrameworkQuery['analysisFramework']>, 'key'>;
type FrameworkWithWidgets = DeepReplace<FrameworkRaw, Omit<WidgetRaw, 'widgetIdDisplay' | 'widthDisplay'>, WidgetFromAF>;
type FrameworkWithTags = DeepReplace<FrameworkWithWidgets, MappingsItemRaw, MappingsItem>;
export type Framework = Omit<FrameworkWithTags, 'properties'> & { properties?: FrameworkProperties };

export type FrameworkInputRaw = DeepMandatory<PurgeNull<AnalysisFrameworkInputType>, 'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'>;
type FrameworkInputWithWidgets = DeepReplace<FrameworkInputRaw, WidgetInputRaw, WidgetFromAF>;
type FrameworkInputWithTags = DeepReplace<
    FrameworkInputWithWidgets, MappingsItemInputRaw, MappingsItem
>;
export type FrameworkInput = Omit<FrameworkInputWithTags, 'properties' | 'previewImage'> & {
    properties?: FrameworkProperties,
    previewImage?: File | null,
};
export type Section = NonNullable<NonNullable<FrameworkInput['primaryTagging']>[number]>;
export type Widget = WidgetFromAF;
