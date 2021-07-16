import { getDateWithTimezone } from '#utils/common';
import { encodeDate } from '@togglecorp/fujs';

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
                endDate.setDate(endDate.getDate() + 1);

                requestFilters.created_at__gte = getDateWithTimezone(filters.createdAt.startDate);
                requestFilters.created_at__lt = getDateWithTimezone(encodeDate(endDate));
            }
        } else if (key === 'publishedOn') {
            if (filters.publishedOn) {
                const endDate = new Date(filters.publishedOn.endDate);
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
