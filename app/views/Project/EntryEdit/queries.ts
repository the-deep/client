import { gql } from '@apollo/client';

const FRAMEWORK = gql`
    fragment ProjectFramework on AnalysisFrameworkDetailType {
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
        id
    }
`;

// eslint-disable-next-line import/prefer-default-export
export const PROJECT_FRAMEWORK = gql`
    ${FRAMEWORK}
    query ProjectFramework($id: ID!) {
        analysisFramework(id: $id) {
            ...ProjectFramework
        }
    }
`;
