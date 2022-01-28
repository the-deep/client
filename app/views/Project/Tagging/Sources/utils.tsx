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
        search,
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

        authoringOrganizationTypes,

        leadAssignees: assignees,
        leadConfidentialities: confidentiality && [confidentiality],
        leadPriorities: priorities,
        leadPublishedOnGte: publishedOnGte,
        leadPublishedOnLte: publishedOnLte,
        leadStatuses: statuses,
        leadTitle: search,
    };
}
