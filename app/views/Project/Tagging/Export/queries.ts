import { gql } from '@apollo/client';
import { SOURCE_FILTER_DATA_FRAGMENT, SOURCE_FILTER_FRAGMENT } from '#views/Project/Tagging/Sources/queries';

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
                filters {
                    id
                    key
                    widgetKey
                    widgetType
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

export const PROJECT_LEADS = gql`
    query ProjectSourceList(
        $projectId: ID!,
        $page: Int,
        $pageSize: Int,
        $ordering: [LeadOrderingEnum!],
        $assignees: [ID!],
        $createdBy: [ID!],
        $authoringOrganizationTypes: [ID!],
        $confidentiality: LeadConfidentialityEnum,
        $createdAtGte: DateTime,
        $createdAtLte: DateTime,
        $emmEntities: String,
        $emmKeywords: String,
        $emmRiskFactors: String,
        $priorities: [LeadPriorityEnum!],
        $publishedOnGte: Date,
        $publishedOnLte: Date,
        $search: String,
        $statuses: [LeadStatusEnum!],
        $sourceOrganizations: [ID!],
        $authorOrganizations: [ID!],
        $entriesFilterData: EntriesFilterDataInputType,
        $hasEntries: Boolean,
        $hasAssessment: Boolean,
    ) {
        project(id: $projectId) {
            id
            leads (
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                assignees: $assignees,
                createdBy: $createdBy,
                authoringOrganizationTypes: $authoringOrganizationTypes,
                confidentiality: $confidentiality,
                createdAtGte: $createdAtGte,
                createdAtLte: $createdAtLte,
                emmEntities: $emmEntities,
                emmKeywords: $emmKeywords,
                emmRiskFactors: $emmRiskFactors,
                priorities: $priorities,
                publishedOnGte: $publishedOnGte,
                publishedOnLte: $publishedOnLte,
                search: $search,
                statuses: $statuses,
                sourceOrganizations: $sourceOrganizations,
                authorOrganizations: $authorOrganizations,
                entriesFilterData: $entriesFilterData,
                hasEntries: $hasEntries,
                hasAssessment: $hasAssessment,
            ) {
                totalCount
                page
                pageSize
                results {
                    id
                    clientId
                    createdAt
                    title
                    publishedOn
                    createdBy {
                        id
                        displayName
                    }
                    project
                    authors {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                    assignee {
                        id
                        displayName
                    }
                    source {
                        mergedAs {
                            id
                            title
                        }
                        id
                        url
                        title
                    }
                    entriesCount {
                        total
                    }
                    filteredEntriesCount
                    leadPreview {
                        pageCount
                    }
                    isAssessmentLead
                }
            }
        }
    }
`;

export const PROJECT_EXPORTS = gql`
    ${SOURCE_FILTER_FRAGMENT}
    ${SOURCE_FILTER_DATA_FRAGMENT}
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
                    type
                    project
                    extraOptions {
                        excelDecoupled
                        reportExportingWidgets
                        reportLevels {
                            id
                            levels {
                                id
                                title
                                sublevels {
                                    id
                                    title
                                    sublevels {
                                        id
                                        title
                                        sublevels {
                                            title
                                            id
                                        }
                                    }
                                }
                            }
                        }
                        reportShowAssessmentData
                        reportShowEntryWidgetData
                        reportShowGroups
                        reportShowLeadEntryId
                        reportStructure {
                            id
                            levels {
                                id
                                levels {
                                    id
                                    levels {
                                        id
                                        levels {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                        reportTextWidgetIds
                    }
                    filtersData {
                        ...SourceFilterDataResponse
                    }
                    filters {
                        ...SourceFilterResponse
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

export const PROJECT_SOURCE_STATS_FOR_EXPORT = gql`
    query ProjectSourceStatsForExport(
        $projectId: ID!,
        $filters: LeadsFilterDataInputType,
    ) {
        project(id: $projectId) {
            id
            stats(filters: $filters) {
                numberOfEntries
                numberOfLeads
                filteredNumberOfEntries
                filteredNumberOfLeads
            }
        }
    }
`;
