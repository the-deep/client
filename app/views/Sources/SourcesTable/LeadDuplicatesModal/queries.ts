import { gql } from '@apollo/client';

import { ORGANIZATION_FRAGMENT } from '#gqlFragments';

// eslint-disable-next-line import/prefer-default-export
export const LEAD_DUPLICATES = gql`
    ${ORGANIZATION_FRAGMENT}
    query LeadDuplicates($projectId: ID!, $duplicatesOf: ID!, $page: Int = 1, $pageSize: Int = 50) {
        project(id: $projectId) {
            id
            leads(duplicatesOf: $duplicatesOf, page: $page, pageSize: $pageSize) {
                page
                pageSize
                totalCount
                results {
                    assignee {
                        id
                        displayName
                    }
                    authors {
                        ...OrganizationGeneralResponse
                    }
                    attachment {
                        file {
                            name
                            url
                        }
                        id
                        mimeType
                        title
                    }
                    clientId
                    confidentiality
                    confidentialityDisplay
                    duplicateLeadsCount
                    filteredEntriesCount
                    id
                    isAssessmentLead
                    leadPreview {
                        pageCount
                        textExtract
                        wordCount
                    }
                    priorityDisplay
                    priority
                    publishedOn
                    status
                    statusDisplay
                    source {
                        ...OrganizationGeneralResponse
                    }
                    text
                    title
                    url
                }
            }
        }
    }
`;

export const LEADS = gql`
    ${ORGANIZATION_FRAGMENT}
    query Leads($projectId: ID!, $ids: [ID!], $page: Int = 1, $pageSize: Int = 50) {
        project(id: $projectId) {
            id
            leads(ids: $ids, page: $page, pageSize: $pageSize) {
                page
                pageSize
                totalCount
                results {
                    assignee {
                        id
                        displayName
                    }
                    authors {
                        ...OrganizationGeneralResponse
                    }
                    attachment {
                        file {
                            name
                            url
                        }
                        id
                        mimeType
                        title
                    }
                    clientId
                    confidentiality
                    confidentialityDisplay
                    duplicateLeadsCount
                    filteredEntriesCount
                    id
                    isAssessmentLead
                    leadPreview {
                        pageCount
                        textExtract
                        wordCount
                    }
                    priorityDisplay
                    priority
                    publishedOn
                    status
                    statusDisplay
                    source {
                        ...OrganizationGeneralResponse
                    }
                    text
                    title
                    url
                }
            }
        }
    }
`;
