import {
    WidgetHint,
} from '#types/newAnalyticalFramework';
import {
    PartialAttributeType,
} from '#views/Project/EntryEdit/schema';
import {
    getType,
} from '#utils/types';

// type ScaleWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SCALE' }>;
// type SingleSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'SELECT' }>;
type MultiSelectWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MULTISELECT' }>;
type OrganigramWidgetAttribute = getType<PartialAttributeType, { widgetType: 'ORGANIGRAM' }>;
type Matrix1dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX1D' }>;
type Matrix2dWidgetAttribute = getType<PartialAttributeType, { widgetType: 'MATRIX2D' }>;
type GeoWidgetAttribute = getType<PartialAttributeType, { widgetType: 'GEO' }>;

export function filterMultiSelectRecommendations(
    recommendation: PartialAttributeType,
): recommendation is MultiSelectWidgetAttribute {
    return recommendation.widgetType === 'MULTISELECT';
}

export function filterOrganigramRecommendations(
    recommendation: PartialAttributeType,
): recommendation is OrganigramWidgetAttribute {
    return recommendation.widgetType === 'ORGANIGRAM';
}

export function filterMatrix1dRecommendations(
    recommendation: PartialAttributeType,
): recommendation is Matrix1dWidgetAttribute {
    return recommendation.widgetType === 'MATRIX1D';
}

export function filterMatrix2dRecommendations(
    recommendation: PartialAttributeType,
): recommendation is Matrix2dWidgetAttribute {
    return recommendation.widgetType === 'MATRIX2D';
}

export function filterGeoRecommendations(
    recommendation: PartialAttributeType,
): recommendation is GeoWidgetAttribute {
    return recommendation.widgetType === 'GEO';
}

export function filterGeoHints(
    hint: WidgetHint,
): hint is { hints: string[]; widgetPk: string; widgetType: 'GEO' } {
    return hint.widgetType === 'GEO';
}

export function filterScaleHints(
    hint: WidgetHint,
): hint is { hints: string[]; widgetPk: string; widgetType: 'SCALE' } {
    return hint.widgetType === 'SCALE';
}

export function filterSelectHints(
    hint: WidgetHint,
): hint is { hints: string[]; widgetPk: string; widgetType: 'SELECT' } {
    return hint.widgetType === 'SELECT';
}
