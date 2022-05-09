import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
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
        $entriesFilterData: LeadEntriesFilterData,
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
