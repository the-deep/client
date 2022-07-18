import { gql } from '@apollo/client';

export const PROJECT_EXPORTS = gql`
    query ProjectExports(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: String,
        $exportedAtGte: DateTime,
        $exportedAtLte: DateTime,
        $search: String,
        $type: [ExportDataTypeEnum!],
    ) {
        project(id: $projectId) {
            id
            exports (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                exportedAtGte: $exportedAtGte,
                exportedAtLte: $exportedAtLte,
                search: $search,
                type: $type,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    title
                    exportType
                    exportedAt
                    status
                    format
                    file {
                        name
                        url
                    }
                }
            }
        }
    }
`;

export const DELETE_EXPORT = gql`
    mutation DeleteExport(
        $projectId: ID!,
        $exportId: ID!,
    ) {
        project(id: $projectId) {
            id
            exportDelete(id: $exportId) {
                ok
                errors
            }
        }
    }
`;
