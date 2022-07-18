import { gql } from '@apollo/client';

import { SOURCE_FILTER_DATA_FRAGMENT, SOURCE_FILTER_FRAGMENT } from '#gqlFragments';

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
            id
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
            analysisFramework {
                id
                filters {
                    id
                    filterType
                    key
                    properties
                    title
                    widgetKey
                    widgetType
                }
            }
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
        sourceStatusOptions: __type(name: "LeadStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourcePriorityOptions: __type(name: "LeadPriorityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        organizationTypes {
            results {
                id
                title
            }
        }
        emmEntititiesOptions: __type(name: "EmmEntityType") {
            name
            enumValues {
                name
                description
            }
        }
        emmRiskFactorsOptions: __type(name: "EmmKeyRiskFactorType") {
            name
            enumValues {
                name
                description
            }
        }
        emmKeywordsOptions: __type(name: "EmmKeyWordType") {
            name
            enumValues {
                name
                description
            }
        }
        entryTypeOptions: __type(name: "EntryTagTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;
