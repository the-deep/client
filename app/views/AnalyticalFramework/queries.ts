import { gql } from '@apollo/client';

const FRAMEWORK = gql`
    fragment Framework on AnalysisFrameworkDetailType {
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
        organization {
            id
            title
            mergedAs {
                id
                title
            }
        }
        predictionTagsMapping {
            widgetType
            widget
            tag
            id
            clientId
            association
        }
        previewImage {
            name
            url
        }
        title
        properties
        id
        description
        allowedPermissions
        isPrivate
        createdBy {
            id
            displayName
        }
        createdAt
        modifiedAt
    }
`;

export const CURRENT_FRAMEWORK = gql`
    ${FRAMEWORK}
    query CurrentFramework($id: ID!) {
        analysisFramework(id: $id) {
            ...Framework
        }
    }
`;

export const CREATE_FRAMEWORK = gql`
    ${FRAMEWORK}
    mutation CreateFramework($data: AnalysisFrameworkInputType!) {
        analysisFrameworkCreate(data: $data) {
            errors
            ok
            result {
                ...Framework
            }
        }
    }
`;

export const UPDATE_FRAMEWORK = gql`
    ${FRAMEWORK}
    mutation UpdateFramework($id: ID!, $data: AnalysisFrameworkInputType!) {
        analysisFramework(id: $id) {
            analysisFrameworkUpdate(data: $data) {
                errors
                ok
                result {
                    ...Framework
                }
            }
        }
    }
`;

export const ASSISTED_PREDICTION_TAGS_QUERY = gql`
    query AssistedPredictionTags {
        assistedTagging {
            predictionTags {
                id
                name
                tagId
            }
        }
    }
`;
