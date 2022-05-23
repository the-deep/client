import { gql } from '@apollo/client';

export const PROJECT_FRAMEWORK_DETAILS = gql`
    query ProjectFrameworkDetails($projectId: ID!) {
        project(id: $projectId) {
            id
            analysisFramework {
                id
                exportables {
                    data
                    id
                    inline
                    order
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                }
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
            }
        }
    }
`;

export const CREATE_EXPORT = gql`
    mutation CreateExport(
        $projectId: ID!,
        $data: ExportCreateInputType!,
    ) {
        project(id: $projectId) {
            id
            exportCreate(data: $data) {
                ok
                errors
                result {
                    id
                    title
                    isPreview
                }
            }
        }
    }
`;

export const EXPORT_PREVIEW = gql`
query ExportPreview($projectId: ID!, $exportId: ID!) {
    project(id: $projectId) {
        id
        export (id: $exportId) {
            id
            status
            file {
                name
                url
            }
            mimeType
            title
        }
    }
}
`;
