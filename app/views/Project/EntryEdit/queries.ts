import { gql } from '@apollo/client';

const ENTRY_FRAGMENT = gql`
    fragment EntryResponse on EntryType {
        clientId
        id
        entryType
        droppedExcerpt
        excerpt
        attributes {
            clientId
            data
            id
            widget
            widgetType
        }
        lead {
            id
        }
        image {
            id
            metadata
            mimeType
            title
            file {
                name
                url
            }
        }
    }
`;

export const LEAD_ENTRIES = gql`
    ${ENTRY_FRAGMENT}
    query LeadEntries(
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            lead(id: $leadId) {
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
                }
                publishedOn
                text
                url
                website
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
                    id
                    title
                    mergedAs {
                        id
                        title
                    }
                }
                authors {
                    id
                    title
                    mergedAs {
                        id
                        title
                    }
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
    query ProjectFramework(
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            id
            analysisFramework {
                id
                primaryTagging {
                    widgets {
                        id
                        clientId
                        key
                        order
                        properties
                        title
                        widgetId
                        width
                    }
                    clientId
                    id
                    order
                    title
                    tooltip
                }
                secondaryTagging {
                    clientId
                    id
                    key
                    order
                    title
                    properties
                    widgetId
                    width
                }
            }
        }
    }
`;

export const BULK_UPDATE_ENTRIES = gql`
    ${ENTRY_FRAGMENT}
    mutation BulkUpdateEntries($projectId:ID!, $deleteIds:[ID!], $entries: [BulkEntryInputType!]) {
        project(id: $projectId) {
            entryBulk(deleteIds: $deleteIds, items: $entries) {
                errors
                result {
                    ...EntryResponse
                }
                deletedResult {
                    id
                }
            }
        }
    }
`;

export const UPDATE_LEAD = gql`
    mutation UpdateLead($projectId:ID!, $leadId:ID!, $data: LeadInputType!) {
        project(id: $projectId) {
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
                    }
                    publishedOn,
                    text,
                    url,
                    website,
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
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                    authors {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
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
