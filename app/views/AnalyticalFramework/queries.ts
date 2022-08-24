import { gql } from '@apollo/client';

import {
    FRAMEWORK_FRAGMENT,
    ORGANIZATION_FRAGMENT,
} from '#gqlFragments';

const FRAMEWORK = gql`
    ${FRAMEWORK_FRAGMENT}
    ${ORGANIZATION_FRAGMENT}
    fragment Framework on AnalysisFrameworkDetailType {
        ...FrameworkResponse
        organization {
            ...OrganizationGeneralResponse
        }
        previewImage {
            name
            url
        }
        title
        properties
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
                group
                hideInAnalysisFrameworkMapping
                isCategory
            }
        }
    }
`;
