import { gql } from '@apollo/client';

export const ENTRY_FRAGMENT = gql`
    fragment EntryResponse on EntryType {
        clientId
        id
        createdAt
        draftEntry
        entryType
        droppedExcerpt
        excerpt
        reviewCommentsCount
        verifiedBy {
            id
        }
        controlled
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

export const FRAMEWORK_FRAGMENT = gql`
    fragment FrameworkResponse on AnalysisFrameworkDetailType {
        id
        assistedTaggingEnabled
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
            clientId
            association
        }
    }
`;

export const SOURCE_FILTER_DATA_FRAGMENT = gql`
    fragment SourceFilterDataResponse on LeadFilterDataType {
        assigneeOptions {
            id
            displayName
            emailDisplay
        }
        authorOrganizationOptions {
            id
            mergedAs {
                id
                title
            }
            title
        }
        authorOrganizationTypeOptions {
            id
            title
        }
        createdByOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterCreatedByOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterGeoAreaOptions {
            id
            regionTitle
            adminLevelTitle
            title
        }
        entryFilterLeadAssigneeOptions {
            id
            displayName
            emailDisplay
        }
        entryFilterLeadAuthorOrganizationOptions {
            id
            mergedAs {
                id
                title
            }
            title
        }
        entryFilterLeadAuthoringOrganizationTypeOptions {
            title
            id
        }
        entryFilterLeadCreatedByOptions {
            displayName
            id
        }
        entryFilterLeadSourceOrganizationOptions {
            id
            title
            mergedAs {
                id
                title
            }
        }
        entryFilterModifiedByOptions {
            displayName
            id
        }
        sourceOrganizationOptions {
            id
            title
        }
    }
`;

export const SOURCE_FILTER_FRAGMENT = gql`
    fragment SourceFilterResponse on LeadsFilterDataType {
        assignees
        authorOrganizations
        authoringOrganizationTypes
        confidentiality
        createdAt
        createdAtGte
        createdAtLte
        createdBy
        emmEntities
        emmKeywords
        emmRiskFactors
        excludeProvidedLeadsId
        extractionStatus
        hasAssessment
        hasEntries
        ids
        modifiedAt
        modifiedAtGte
        modifiedAtLte
        modifiedBy
        ordering
        priorities
        publishedOn
        publishedOnGte
        publishedOnLte
        search
        sourceOrganizations
        sourceTypes
        statuses
        text
        url
        entriesFilterData {
            controlled
            createdAt
            createdAtGte
            createdAtLte
            createdBy
            entriesId
            entryTypes
            excerpt
            geoCustomShape
            id
            leadAssignees
            leadAuthorOrganizations
            leadAuthoringOrganizationTypes
            leadConfidentialities
            leadCreatedBy
            leadGroupLabel
            leadPriorities
            leadPublishedOn
            leadPublishedOnLte
            leadPublishedOnGte
            leadSourceOrganizations
            leadStatuses
            leadTitle
            leads
            modifiedAt
            modifiedAtGte
            modifiedAtLte
            modifiedBy
            projectEntryLabels
            search
            filterableData {
                filterKey
                includeSubRegions
                useAndOperator
                useExclude
                value
                valueGte
                valueList
                valueLte
            }
        }
    }
`;

export const ORGANIZATION_FRAGMENT = gql`
    fragment OrganizationGeneralResponse on OrganizationType {
        id
        title
        verified
        mergedAs {
            id
            title
        }
    }
`;
