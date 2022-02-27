import {
    WidgetHint,
} from '#types/newAnalyticalFramework';

export function filterNumberHints(
    hint: WidgetHint,
): hint is { hints: number[]; widgetPk: string; widgetType: 'NUMBER' } {
    return hint.widgetType === 'NUMBER';
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

export function filterDateHints(
    hint: WidgetHint,
): hint is { hints: string[]; widgetPk: string; widgetType: 'DATE' } {
    return hint.widgetType === 'DATE';
}
