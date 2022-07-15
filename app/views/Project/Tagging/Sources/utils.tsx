import { encodeDate, listToMap, isDefined } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import {
    // LeadOrderingEnum,
    ProjectSavedLeadFilterQuery,
} from '#generated/types';
import { convertDateToIsoDateTime } from '#utils/common';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';
import { FormType } from './SourcesFilter/schema';

type RawSourcesFilter = NonNullable<NonNullable<NonNullable<ProjectSavedLeadFilterQuery>['project']>['userSavedLeadFilter']>['filters'];
type FaramValues = Omit<FormType, 'projectId'>;

// FIXME: move this to common utils
// FIXME: get this from deep-ui
export enum SortDirection {
    'asc' = 'Ascending',
    'dsc' = 'Descending',
}

// FIXME: move this to common utils
function getDateString(dateTimeString: string | null | undefined) {
    if (dateTimeString && Date.parse(dateTimeString)) {
        return encodeDate(new Date(dateTimeString));
    }
    return dateTimeString;
}

export function transformSourcesFilterToEntriesFilter(filters: FaramValues) {
    const {
        assignees,
        confidentiality,
        priorities,
        statuses,
        publishedOnGte,
        publishedOnLte,
        authoringOrganizationTypes,
        entriesFilterData,
        createdAtGte,
        createdAtLte,
        createdBy,
        search,
        authorOrganizations,
        sourceOrganizations,
    } = filters;

    return {
        ...entriesFilterData,
        filterableData: (entriesFilterData?.filterableData?.length ?? 0) > 0
            ? entriesFilterData?.filterableData
            : undefined,
        createdAtGte: convertDateToIsoDateTime(entriesFilterData?.createdAtGte),
        createdAtLte: convertDateToIsoDateTime(entriesFilterData?.createdAtLte, { endOfDay: true }),
        leadCreatedAtGte: convertDateToIsoDateTime(createdAtGte),
        leadCreatedAtLte: convertDateToIsoDateTime(createdAtLte, { endOfDay: true }),

        leadAssignees: assignees,
        leadCreatedBy: createdBy,
        leadConfidentialities: confidentiality && [confidentiality],
        leadPriorities: priorities,
        leadPublishedOnGte: publishedOnGte,
        leadPublishedOnLte: publishedOnLte,
        leadStatuses: statuses,
        leadTitle: search,
        leadAuthorOrganizations: authorOrganizations,
        leadSourceOrganizations: sourceOrganizations,
        leadAuthoringOrganizationTypes: authoringOrganizationTypes,
    };
}

/*
export function getSortState(
    orderingFilter: LeadOrderingEnum[] | null | undefined,
): { name: string; direction: SortDirection } | undefined {
    const [direction, ...orderingName] = orderingFilter?.[0] ? orderingFilter[0].split('_') : [];
    return direction ? ({
        name: orderingName.join('_'),
        direction: direction === 'ASC' ? SortDirection.asc : SortDirection.dsc,
    }) : undefined;
}
*/

export function transformRawFiltersToFormValues(
    filters: RawSourcesFilter,
    frameworkFilters: FrameworkFilterType[] | null | undefined,
) {
    if (!filters) {
        return {};
    }
    const {
        createdAt,
        createdAtGte,
        createdAtLte,
        entriesFilterData,
        ...others
    } = filters;

    const frameworkFiltersMapping = listToMap(
        frameworkFilters ?? [],
        (item) => item.key,
        (item) => item,
    );

    const formValues = {
        ...others,
        createdAt: getDateString(createdAt),
        createdAtGte: getDateString(createdAtGte),
        createdAtLte: getDateString(createdAtLte),
        entriesFilterData: {
            ...entriesFilterData,
            createdAtGte: getDateString(entriesFilterData?.createdAtGte),
            createdAtLte: getDateString(entriesFilterData?.createdAtLte),
            filterableData: entriesFilterData?.filterableData?.map((item) => {
                const key = item.filterKey;
                const filterItem = frameworkFiltersMapping[key];
                if (!filterItem) {
                    return undefined;
                }
                if (
                    filterItem.widgetType === 'SELECT'
                    || filterItem.widgetType === 'MULTISELECT'
                    || filterItem.widgetType === 'SCALE'
                    || filterItem.widgetType === 'ORGANIGRAM'
                    || filterItem.widgetType === 'MATRIX1D'
                    || filterItem.widgetType === 'MATRIX2D'
                ) {
                    const keyMapping = listToMap(
                        filterItem.properties?.options ?? [],
                        (option) => option.key,
                        () => true,
                    );
                    const newItem = {
                        ...item,
                        valueList: item.valueList?.filter((value) => keyMapping[value]),
                    };
                    return newItem;
                }
                return item;
            }).filter(isDefined),
        },
    };
    return removeNull(formValues);
}
