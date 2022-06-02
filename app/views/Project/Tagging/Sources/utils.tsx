import { encodeDate } from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';
import { LeadOrderingEnum, ProjectSavedLeadFilterQuery } from '#generated/types';
import { convertDateToIsoDateTime } from '#utils/common';
import { FormType } from './SourcesFilter/schema';

type RawSourcesFilter = NonNullable<NonNullable<NonNullable<ProjectSavedLeadFilterQuery>['project']>['userSavedLeadFilter']>['filters'];
type FaramValues = Omit<FormType, 'projectId'>;

enum SortDirection {
    'asc' = 'Ascending',
    'dsc' = 'Descending',
}

// eslint-disable-next-line import/prefer-default-export
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

export function getSortState(
    orderingFilter: LeadOrderingEnum[] | null | undefined,
): { name: string; direction: SortDirection } | undefined {
    const [direction, ...orderingName] = orderingFilter?.[0] ? orderingFilter[0].split('_') : [];
    if (direction) {
        return ({
            name: orderingName.join('_'),
            direction: direction === 'ASC' ? SortDirection.asc : SortDirection.dsc,
        });
    }
    return undefined;
}

function getDateString(dateTimeString: string | null | undefined) {
    if (dateTimeString && Date.parse(dateTimeString)) {
        return encodeDate(new Date(dateTimeString));
    }
    return dateTimeString;
}

export function transformRawFiltersToFormValues(filters: RawSourcesFilter) {
    if (filters) {
        const {
            createdAt,
            createdAtGte,
            createdAtLte,
            entriesFilterData,
            ...others
        } = filters;
        const formValues = {
            ...others,
            createdAt: getDateString(createdAt),
            createdAtGte: getDateString(createdAtGte),
            createdAtLte: getDateString(createdAtLte),
            entriesFilterData: {
                ...entriesFilterData,
                createdAtGte: getDateString(entriesFilterData?.createdAtGte),
                createdAtLte: getDateString(entriesFilterData?.createdAtLte),
            },
        };
        return removeNull(formValues);
    }
    return {};
}
