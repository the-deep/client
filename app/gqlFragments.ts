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
                adminLevelTitle
                id
                regionTitle
                title
                adminLevelLevel
                parentTitles
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
            adminLevelLevel
            adminLevelTitle
            id
            regionTitle
            title
            parentTitles
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
        isAssessment
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
        shortName
        logo {
            id
            file {
                url
            }
        }
        mergedAs {
            id
            title
            shortName
            logo {
                id
                file {
                    url
                }
            }
        }
    }
`;

export const LAST_ACTIVE_PROJECT_FRAGMENT = gql`
    fragment LastActiveProjectResponse on ProjectDetailType {
        allowedPermissions
        currentUserRole
        analysisFramework {
            id
        }
        hasAssessmentTemplate
        id
        isPrivate
        title
        isVisualizationEnabled
        isVisualizationAvailable
        membershipPending
        enablePubliclyViewableAnalysisReportSnapshot
        isRejected
    }
`;

export const TEXT_STYLE_FRAGMENT = gql`
    fragment TextStyle on AnalysisReportTextStyleType {
        align
        color
        family
        size
        weight
    }
`;

export const PADDING_STYLE_FRAGMENT = gql`
    fragment PaddingStyle on AnalysisReportPaddingStyleType {
        top
        bottom
        right
        left
    }
`;

export const BORDER_STYLE_FRAGMENT = gql`
    fragment BorderStyle on AnalysisReportBorderStyleType {
        color
        opacity
        style
        width
    }
`;

export const ASSESSMENT_REGISTRY_FRAGMENT = gql`
    ${ORGANIZATION_FRAGMENT}
    fragment AssessmentRegistryResponse on AssessmentRegistryType {
        bgCountries {
            id
            title
        }
        bgCrisisStartDate
        bgCrisisType
        bgCrisisTypeDisplay
        bgPreparedness
        clientId
        confidentiality
        coordinatedJoint
        dataCollectionEndDate
        dataCollectionStartDate
        detailsType
        family
        externalSupport
        frequency
        id
        lead {
            id
        }
        leadOrganizations {
            ...OrganizationGeneralResponse,
        }
        internationalPartners {
            ...OrganizationGeneralResponse,
        }
        nationalPartners {
            ...OrganizationGeneralResponse,
        }
        donors {
            ...OrganizationGeneralResponse,
        }
        governments {
            ...OrganizationGeneralResponse,
        }
        noOfPages
        publicationDate
        objectives
        limitations
        language
        methodologyAttributes {
            id
            clientId
            samplingSize
            dataCollectionTechnique
            proximity
            samplingApproach
            unitOfAnalysis
            unitOfReporting
        }
        focuses
        sectors
        affectedGroups
        protectionInfoMgmts
        locations {
            id
            adminLevelTitle
            regionTitle
            title
        }
        cna {
            id
            clientId
            answer
            question {
                id
                question
            }
        }
    }
`;
