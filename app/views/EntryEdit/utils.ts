import {
    randomString,
    isDefined,
} from '@togglecorp/fujs';

import { PartialAttributeType } from '#components/entry/schema';
import { Widget } from '#components/entry/types';
import { getWidgetVersion } from '#types/newAnalyticalFramework';

// eslint-disable-next-line import/prefer-default-export
export function createDefaultAttributes(
    allWidgets: Widget[],
) {
    const defaultAttributes = allWidgets.map((item) => {
        let attr: PartialAttributeType | undefined;
        const clientId = randomString();
        const widget = item.id;

        if (item.widgetId === 'TEXT' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'NUMBER' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'DATE' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'TIME' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        } else if (item.widgetId === 'SCALE' && item.properties?.defaultValue) {
            attr = {
                clientId,
                widget,
                widgetType: item.widgetId,
                widgetVersion: getWidgetVersion(item.widgetId),
                data: {
                    value: item.properties.defaultValue,
                },
            };
        }
        return attr;
    }).filter(isDefined);

    return defaultAttributes;
}
