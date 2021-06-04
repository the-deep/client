import produce from 'immer';
import { isNotDefined } from '@togglecorp/fujs';

import { PartialWidget } from '../WidgetPreview';
import { Widget } from '../types';

export function findWidget(
    widgets: Widget[],
    widgetId: string,
): Widget | undefined {
    return widgets.find(
        w => w.clientId === widgetId,
    );
}

export function injectWidget(
    widgets: Widget[],
    widget: Widget,
): Widget[];
export function injectWidget(
    widgets: PartialWidget[],
    widget: PartialWidget,
): PartialWidget[];
export function injectWidget(
    widgets: PartialWidget[],
    widget: PartialWidget,
) {
    return produce(widgets, (safeWidgets) => {
        const widgetIndex = safeWidgets.findIndex(
            w => w.clientId === widget.clientId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            safeWidgets.push(widget);
        } else {
            safeWidgets.splice(widgetIndex, 1, widget);
        }
    });
}

export function deleteWidget(
    widgets: Widget[],
    widgetId: string,
): Widget[] {
    return produce(widgets, (safeWidgets) => {
        const widgetIndex = safeWidgets.findIndex(
            w => w.clientId === widgetId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            return;
        }

        safeWidgets.splice(widgetIndex, 1);
    });
}
