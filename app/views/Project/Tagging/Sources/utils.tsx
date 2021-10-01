import { encodeDate } from '@togglecorp/fujs';

import { getDateWithTimezone } from '#utils/common';

// FIXME: do we need these? we should be able to remove these
export interface FilterFormType {
    createdAt?: {
        startDate: string;
        endDate: string;
    };
    publishedOn?: {
        startDate: string;
        endDate: string;
    };
    assignee?: string[];
    status?: string[];
    search?: string;
    exists?: string;
    priority?: string[];
    authoringOrganizationTypes?: string[];
    confidentiality?: string[];
    emmRiskFactors?: string[];
    emmKeywords?: string[];
    emmEntities?: string[];
}

export interface TransformedFilterFormType {
    [key: string]: string | string[] | undefined;
}

export const getFiltersForRequest = (filters: FilterFormType | undefined) => {
    if (!filters) {
        return {};
    }
    const requestFilters: TransformedFilterFormType = {};
    (Object.keys(filters) as Array<keyof FilterFormType>).forEach((key) => {
        if (key === 'createdAt') {
            if (filters.createdAt) {
                const endDate = new Date(filters.createdAt.endDate);
                // A day added to include 24 hours of endDate
                endDate.setDate(endDate.getDate() + 1);

                requestFilters.created_at__gte = getDateWithTimezone(filters.createdAt.startDate);
                requestFilters.created_at__lt = getDateWithTimezone(encodeDate(endDate));
            }
        } else if (key === 'publishedOn') {
            if (filters.publishedOn) {
                const endDate = new Date(filters.publishedOn.endDate);
                // A day added to include 24 hours of endDate
                endDate.setDate(endDate.getDate() + 1);

                requestFilters.published_on__gte = filters.publishedOn.startDate;
                requestFilters.published_on__lt = encodeDate(endDate);
            }
        } else {
            requestFilters[key] = filters[key];
        }
    });
    return requestFilters;
};

/* DateInput only supports date(without timezone offset). The filters endDate and startDate
 * accept datetime. When filtering with datetime, we should always send the timezone information
 * to the server. getValidDateRangeValues function converts DateInput value to valid datetime.
 */
export function getValidDateRangeValues(dateRange?: { startDate: string, endDate: string}) {
    if (dateRange) {
        const endDate = new Date(dateRange.endDate);
        endDate.setDate(endDate.getDate() + 1);
        return {
            startDate: getDateWithTimezone(dateRange.startDate),
            endDate: getDateWithTimezone(encodeDate(endDate)),
        };
    }
    return undefined;
}
