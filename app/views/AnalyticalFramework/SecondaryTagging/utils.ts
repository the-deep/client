import produce from 'immer';
import { isNotDefined } from '@togglecorp/fujs';

import { Widget } from '#types/newAnalyticalFramework';

import { PartialWidget } from '#components/framework/AttributeInput';

export interface TempConditional {
    widgetId: string,
    title?: string;
    value: NonNullable<Widget['conditional']> | undefined,
}

export function findWidget(
    widgets: Widget[] | undefined = [],
    widgetId: string,
): Widget | undefined {
    return widgets.find(
        (w) => w.clientId === widgetId,
    );
}

export function injectWidget(
    widgets: Widget[] | undefined,
    widget: Widget,
): Widget[];
export function injectWidget(
    widgets: PartialWidget[] | undefined,
    widget: PartialWidget,
): PartialWidget[];
export function injectWidget(
    widgets: PartialWidget[] | undefined = [],
    widget: PartialWidget,
) {
    return produce(widgets, (safeWidgets) => {
        const widgetIndex = safeWidgets.findIndex(
            (w) => w.clientId === widget.clientId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            const orderList = safeWidgets.map((w) => w.order);
            const maxOrder = Math.max(...orderList, 0);

            safeWidgets.push({
                ...widget,
                order: maxOrder + 1,
            });
        } else {
            safeWidgets.splice(widgetIndex, 1, widget);
        }
    });
}

export function injectWidgetConditional(
    widgets: Widget[] | undefined = [],
    conditional: TempConditional,
) {
    return produce(widgets, (safeWidgets) => {
        const widgetIndex = safeWidgets.findIndex(
            (w) => w.clientId === conditional.widgetId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            return;
        }
        // eslint-disable-next-line no-param-reassign
        safeWidgets[widgetIndex].conditional = conditional.value;
    });
}

export function deleteWidget(
    widgets: Widget[] | undefined = [],
    widgetId: string,
): Widget[] {
    return produce(widgets, (safeWidgets) => {
        const widgetIndex = safeWidgets.findIndex(
            (w) => w.clientId === widgetId,
        );

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            return;
        }

        safeWidgets.splice(widgetIndex, 1);
    });
}
