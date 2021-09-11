import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
export const PROJECT_FRAMEWORK = gql`
    query ProjectFramework(
        $projectId: ID!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            lead(id: $leadId) {
                id
                entries {
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
            }
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
