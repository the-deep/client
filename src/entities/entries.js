import { listToMap } from '@togglecorp/fujs';
import { unflat, getChildren } from '#utils/tree';

// TODO: move this somewhere else
const ONE_DAY = 24 * 60 * 60 * 1000;

const toDays = (date) => {
    if (!date) {
        return undefined;
    }

    return Math.round(new Date(date).getTime() / ONE_DAY);
};

const totMinutes = (time) => {
    if (!time) {
        return undefined;
    }

    const splits = time.split(':');
    if (splits.length < 2) {
        return undefined;
    }

    return (parseInt(splits[0], 10) * 60) + parseInt(splits[1], 10);
};

// eslint-disable-next-line import/prefer-default-export
export const processEntryFilters = (filters, framework, geoOptions) => {
    const { widgets } = framework;

    const widgetsMapping = listToMap(
        widgets,
        widget => widget.key,
        widget => widget,
    );

    const flatGeoOptions = Object.entries(geoOptions)
        .map(([key, value]) => value)
        .flat();

    const treeMap = unflat(
        flatGeoOptions,
        undefined,
        item => item.key,
        item => item.parent,
    );

    const result = [];
    Object.keys(filters).forEach((filterKey) => {
        const filterOptions = filters[filterKey];
        const widget = widgetsMapping[filterKey];

        if (!widget) {
            return;
        }
        const { widgetId } = widget;

        if (widgetId === 'dateWidget') {
            result.push([
                `${filterKey}__gt`,
                toDays(filterOptions.startDate),
            ]);
            result.push([
                `${filterKey}__lt`,
                toDays(filterOptions.endDate),
            ]);
        } else if (widgetId === 'timeWidget') {
            result.push([
                `${filterKey}__gt`,
                totMinutes(filterOptions.startTime),
            ]);
            result.push([
                `${filterKey}__lt`,
                totMinutes(filterOptions.endTime),
            ]);
        } else if (widgetId === 'geoWidget') {
            const { areas, includeSubRegions } = filterOptions;

            let options = areas;
            if (includeSubRegions) {
                const bubbledOptions = getChildren(
                    new Set(areas),
                    treeMap,
                    item => item.key,
                    item => item.children,
                );
                options = [...bubbledOptions];
            }

            result.push([filterKey, options]);
        } else {
            result.push([filterKey, filterOptions]);
        }
    });
    return result;
};

