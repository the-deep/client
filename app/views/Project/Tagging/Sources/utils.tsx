import {
    ProjectSourcesQueryVariables,
} from '#generated/types';

// eslint-disable-next-line import/prefer-default-export
export function transformSourcesFilterToEntiesFilter(filters: Omit<ProjectSourcesQueryVariables, 'projectId'>) {
    const {
        assignees,
        confidentiality,
        priorities,
        statuses,
        publishedOn_Gte: publisedOnGte,
        publishedOn_Lt: publishedOnLt,
        authoringOrganizationTypes,
        entriesFilterData,
    } = filters;

    return {
        ...entriesFilterData,
        authoringOrganizationTypes,
        leadAssignees: assignees,
        leadConfidentialities: confidentiality && [confidentiality],
        leadPriorities: priorities,
        leadPublishedOn_Gte: publisedOnGte,
        leadPublishedOn_Lt: publishedOnLt,
        leadStatuses: statuses,
    };
}
