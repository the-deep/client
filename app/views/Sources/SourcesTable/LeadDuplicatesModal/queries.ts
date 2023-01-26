import { gql } from '@apollo/client';

import { ORGANIZATION_FRAGMENT } from '#gqlFragments';

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

export const LEAD = gql`
    ${ORGANIZATION_FRAGMENT}
    query Lead($projectId: ID!, $leadId: ID!) {
        project(id: $projectId) {
            id
            lead(id: $leadId) {
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
`;
