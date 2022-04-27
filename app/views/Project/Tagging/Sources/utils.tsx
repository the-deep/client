import { convertDateToIsoDateTime } from '#utils/common';

import { FormType } from './SourcesFilter/schema';

type FaramValues = Omit<FormType, 'projectId'>;

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
