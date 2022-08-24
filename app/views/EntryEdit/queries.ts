import { gql } from '@apollo/client';
import {
    ORGANIZATION_FRAGMENT,
    FRAMEWORK_FRAGMENT,
    ENTRY_FRAGMENT,
} from '#gqlFragments';

// FIXME: use fragment for lead as well
export const LEAD_ENTRIES = gql`
    ${ORGANIZATION_FRAGMENT}
    ${ENTRY_FRAGMENT}
    query LeadEntries(
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            lead(id: $leadId) {
                id
                title
                leadGroup {
                    id
                    title
                }
                title
                clientId
                assignee {
                    id
                    displayName
                    emailDisplay
                }
                publishedOn
                text
                url
                attachment {
                    id
                    title
                    mimeType
                    file {
                        url
                    }
                }
                isAssessmentLead
                sourceType
                priority
                confidentiality
                status
                source {
                    ...OrganizationGeneralResponse
                }
                authors {
                    ...OrganizationGeneralResponse
                }
                emmEntities {
                    id
                    name
                }
                emmTriggers {
                    id
                    emmKeyword
                    emmRiskFactor
                    count
                }
                entries {
                    ...EntryResponse
                }
            }
        }
    }
`;

export const PROJECT_FRAMEWORK = gql`
    ${FRAMEWORK_FRAGMENT}
    query ProjectFramework(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisFramework {
                ...FrameworkResponse
            }
        }
    }
`;

export const BULK_UPDATE_ENTRIES = gql`
    ${ENTRY_FRAGMENT}
    mutation BulkUpdateEntries($projectId:ID!, $deleteIds:[ID!], $entries: [BulkEntryInputType!]) {
        project(id: $projectId) {
            id
            entryBulk(deleteIds: $deleteIds, items: $entries) {
                errors
                result {
                    ...EntryResponse
                }
                deletedResult {
                    id
                    clientId
                }
            }
        }
    }
`;

export const UPDATE_LEAD = gql`
    ${ORGANIZATION_FRAGMENT}
    mutation UpdateLead($projectId:ID!, $leadId:ID!, $data: LeadInputType!) {
        project(id: $projectId) {
            id
            leadUpdate(data: $data, id: $leadId) {
                result {
                    title,
                    leadGroup {
                        id,
                        title,
                    },
                    title,
                    clientId,
                    assignee {
                        id,
                        displayName,
                        emailDisplay
                    }
                    publishedOn,
                    text,
                    url,
                    attachment {
                        id
                        title
                        mimeType
                        file {
                            url
                        }
                    }
                    isAssessmentLead
                    sourceType
                    priority
                    confidentiality
                    status
                    source {
                        ...OrganizationGeneralResponse
                    }
                    authors {
                        ...OrganizationGeneralResponse
                    }
                    emmEntities {
                        id
                        name
                    }
                    emmTriggers {
                        id
                        emmKeyword
                        emmRiskFactor
                        count
                    }
                }
                errors
                ok
            }
        }
    }
`;
