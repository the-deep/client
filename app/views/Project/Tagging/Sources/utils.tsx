import {
    ProjectSourcesQueryVariables,
} from '#generated/types';
import {
    convertDateToIsoDateTime,
} from '#utils/common';

// eslint-disable-next-line import/prefer-default-export
export function transformSourcesFilterToEntriesFilter(filters: Omit<ProjectSourcesQueryVariables, 'projectId'>) {
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
    } = filters;

    return {
        ...entriesFilterData,
        createdAtGte: convertDateToIsoDateTime(createdAtGte),
        createdAtLte: convertDateToIsoDateTime(createdAtLte, { endOfDay: true }),
        authoringOrganizationTypes,
        leadAssignees: assignees,
        leadConfidentialities: confidentiality && [confidentiality],
        leadPriorities: priorities,
        leadPublishedOnGte: publishedOnGte,
        leadPublishedOnLte: publishedOnLte,
        leadStatuses: statuses,
    };
}
