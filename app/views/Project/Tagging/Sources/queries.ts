import { gql } from '@apollo/client';

export const SOURCE_FILTER_DATA_FRAGMENT = gql`
    fragment SourceFilterDataResponse on LeadFilterDataType {
        assigneeOptions {
            id
            displayName
            emailDisplay
        }
        authorOrganizationOptions {
            id
            mergedAs {
                id
                title
            }
            title
        }
        authorOrganizationTypeOptions {
            id
            title
        }
        createdByOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterCreatedByOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterGeoAreaOptions {
            id
            regionTitle
            adminLevelTitle
            title
        }
        entryFilterLeadAssigneeOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterLeadAuthorOrganizationOptions {
            id
            mergedAs {
                id
                title
            }
            title
        }
        entryFilterLeadAuthoringOrganizationTypeOptions {
            title
            id
        }
        entryFilterLeadCreatedByOptions {
            displayName
            id
        }
        entryFilterLeadSourceOrganizationOptions {
            id
            title
            mergedAs {
                id
                title
            }
        }
        entryFilterModifiedByOptions {
            displayName
            id
        }
        sourceOrganizationOptions {
            id
            title
        }
    }
`;

export const SOURCE_FILTER_FRAGMENT = gql`
    fragment SourceFilterResponse on LeadsFilterDataType {
        assignees
        authorOrganizations
        authoringOrganizationTypes
        confidentiality
        createdAt
        createdAtGte
        createdAtLte
        createdBy
        emmEntities
        emmKeywords
        emmRiskFactors
        excludeProvidedLeadsId
        extractionStatus
        hasAssessment
        hasEntries
        ids
        modifiedAt
        modifiedAtGte
        modifiedAtLte
        modifiedBy
        ordering
        priorities
        publishedOn
        publishedOnGte
        publishedOnLte
        search
        sourceOrganizations
        sourceTypes
        statuses
        text
        url
        entriesFilterData {
            controlled
            createdAt
            createdAtGte
            createdAtLte
            createdBy
            entriesId
            entryTypes
            excerpt
            geoCustomShape
            id
            leadAssignees
            leadAuthorOrganizations
            leadAuthoringOrganizationTypes
            leadConfidentialities
            leadCreatedBy
            leadGroupLabel
            leadPriorities
            leadPublishedOn
            leadPublishedOnLte
            leadPublishedOnGte
            leadSourceOrganizations
            leadStatuses
            leadTitle
            leads
            modifiedAt
            modifiedAtGte
            modifiedAtLte
            modifiedBy
            projectEntryLabels
            search
            filterableData {
                filterKey
                includeSubRegions
                useAndOperator
                useExclude
                value
                valueGte
                valueList
                valueLte
            }
        }
    }
`;

export const PROJECT_SOURCES = gql`
    query ProjectSources(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: [LeadOrderingEnum!],
        $assignees: [ID!],
        $createdBy: [ID!],
        $authoringOrganizationTypes: [ID!],
        $confidentiality: LeadConfidentialityEnum,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $emmEntities: String,
        $emmKeywords: String,
        $emmRiskFactors: String,
        $priorities: [LeadPriorityEnum!],
        $publishedOnGte: Date,
        $publishedOnLte: Date,
        $search: String,
        $statuses: [LeadStatusEnum!],
        $sourceOrganizations: [ID!],
        $authorOrganizations: [ID!],
        $entriesFilterData: EntriesFilterDataInputType,
        $hasEntries: Boolean,
        $hasAssessment: Boolean,
    ) {
        project(id: $projectId) {
            id
            leads (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                assignees: $assignees,
                createdBy: $createdBy,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                confidentiality: $confidentiality,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                emmEntities: $emmEntities,
                emmKeywords: $emmKeywords,
                emmRiskFactors: $emmRiskFactors,
                priorities: $priorities,
                publishedOnGte: $publishedOnGte,
                publishedOnLte: $publishedOnLte,
                search: $search,
                statuses: $statuses,
                sourceOrganizations: $sourceOrganizations,
                authorOrganizations: $authorOrganizations,
                entriesFilterData: $entriesFilterData,
                hasEntries: $hasEntries,
                hasAssessment: $hasAssessment,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    confidentiality
                    clientId
                    status
                    statusDisplay
                    createdAt
                    title
                    publishedOn
                    priority
                    priorityDisplay
                    url
                    attachment {
                        id
                        title
                        mimeType
                        file {
                            url
                        }
                    }
                    assessmentId
                    createdBy {
                        id
                        displayName
                    }
                    project
                    authors {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                    assignee {
                        id
                        displayName
                    }
                    source {
                        mergedAs {
                            id
                            title
                            url
                        }
                        id
                        url
                        title
                    }
                    entriesCount {
                        controlled
                        total
                    }
                    filteredEntriesCount
                    leadPreview {
                        pageCount
                    }
                    isAssessmentLead
                }
            }
        }
    }
`;

export const SAVE_LEAD_FILTER = gql`
    mutation SaveLeadFilter($projectId: ID!, $filters: LeadsFilterDataInputType!) {
        project(id: $projectId) {
            leadFilterSave(data: {filters: $filters}) {
                errors
                ok
                result {
                    id
                    modifiedAt
                    title
                    createdAt
                }
            }
        }
    }
`;

export const PROJECT_SAVED_LEAD_FILTER = gql`
    ${SOURCE_FILTER_FRAGMENT}
    ${SOURCE_FILTER_DATA_FRAGMENT}
    query ProjectSavedLeadFilter($projectId: ID!) {
        project(id: $projectId) {
            id
            userSavedLeadFilter {
                id
                title
                modifiedAt
                filtersData {
                    ...SourceFilterDataResponse
                }
                filters {
                    ...SourceFilterResponse
                }
            }
        }
    }
`;
