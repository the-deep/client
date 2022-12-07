import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
export const CONNECTOR_SOURCES_COUNT = gql`
    query ConnectorSourcesCount($projectId: ID!) {
        project(id: $projectId) {
            id
            unifiedConnector {
                sourceCountWithoutIngnoredAndAdded
            }
        }
    }
`;
