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
                title
                widgetId
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
        }
        organization {
            id
            title
            mergedAs {
                id
                title
            }
        }
        title
        id
        description
        allowedPermissions
        isPrivate
        createdBy {
            id
            displayName
        }
        createdAt
    }
`;

// eslint-disable-next-line import/prefer-default-export
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