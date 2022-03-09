import { gql } from '@apollo/client';

const ENTRY_FRAGMENT = gql`
    fragment EntryResponse on EntryType {
        clientId
        id
        createdAt
        entryType
        droppedExcerpt
        excerpt
        reviewCommentsCount
        attributes {
            clientId
            data
            id
            widget
            widgetType
            widgetVersion
            geoSelectedOptions {
                id
                adminLevelTitle
                regionTitle
                title
            }
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

// FIXME: use fragment for lead as well

export const LEAD_ENTRIES = gql`
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
                        conditional {
                            parentWidget
                            parentWidgetType
                            conditions
                        }
                        title
                        widgetId
                        width
                        version
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
                    conditional {
                        parentWidget
                        parentWidgetType
                        conditions
                    }
                    widgetId
                    width
                    version
                }
                predictionTagsMapping {
                    id
                    tag
                    widget
                    widgetType
                    association
                }
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
