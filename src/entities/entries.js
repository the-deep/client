import {
    listToMap,
    union,
    encodeDate,
} from '@togglecorp/fujs';
import { generateRelation } from '#utils/forest';
import { getDateWithTimezone } from '#utils/common';

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

    const treeMap = generateRelation(
        flatGeoOptions,
        item => item.key,
        item => item.parent,
    );

    const result = [];
    Object.keys(filters).forEach((filterKey) => {
        const filterOptions = filters[filterKey];
        if (!filterOptions) {
            return;
        }

        const widget = widgetsMapping[filterKey];
        const { widgetId } = widget || {};

        // TODO: handle static filters
        // TODO: Fix date filter for date widgets
        // if (filterKey === 'search' || filterKey === 'created_by') {
        if (widgetId === 'dateWidget' || widgetId === 'dateRangeWidget') {
            const { startDate, endDate } = filterOptions;
            result.push([
                `${filterKey}__gt`,
                toDays(startDate),
            ]);
            result.push([
                `${filterKey}__lt`,
                toDays(endDate),
            ]);
        } else if (filterKey === 'created_at') {
            const { startDate, endDate: oldEndDate } = filterOptions;
            const endDate = new Date(oldEndDate);
            endDate.setDate(endDate.getDate() + 1);

            result.push([
                `${filterKey}__gte`,
                getDateWithTimezone(startDate),
            ]);
            result.push([
                `${filterKey}__lt`,
                getDateWithTimezone(encodeDate(endDate)),
            ]);
        } else if (widgetId === 'timeWidget') {
            const { startTime, endTime } = filterOptions;
            result.push([
                `${filterKey}__gt`,
                totMinutes(startTime),
            ]);
            result.push([
                `${filterKey}__lt`,
                totMinutes(endTime),
            ]);
        } else if (widgetId === 'geoWidget') {
            const { areas, includeSubRegions } = filterOptions;

            let options = areas;
            if (includeSubRegions) {
                let newOptions = new Set(areas);
                newOptions.forEach((option) => {
                    const treeNode = treeMap[option];
                    if (!treeNode) {
                        return;
                    }
                    newOptions = union(newOptions, new Set(Object.values(treeNode.children)));
                });
                options = [...newOptions];
            }

            result.push([filterKey, options]);
        } else {
            result.push([filterKey, filterOptions]);
        }
    });
    return result;
};

