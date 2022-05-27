import { gql, useQuery } from '@apollo/client';
import {
    SourceFilterOptionsQueryVariables,
    OrganizationType,
} from '#generated/types';
import {
    SourceFilterOptions,
} from './types';

export function organizationTypeKeySelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.id;
}

export function organizationTypeLabelSelector(value: Pick<OrganizationType, 'id' | 'title'>) {
    return value.title;
}

interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const hasEntryOptions: BooleanOption[] = [
    { key: 'true', value: 'Has entry' },
    { key: 'false', value: 'Does not have entry' },
];

const hasAssessmentOptions: BooleanOption[] = [
    { key: 'true', value: 'Has assessment' },
    { key: 'false', value: 'Does not have assessment' },
];

const SOURCE_FILTER_OPTIONS = gql`
    query SourceFilterOptions(
        $projectId: ID!,
    ) {
        sourceStatusOptions: __type(name: "LeadStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourcePriorityOptions: __type(name: "LeadPriorityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        project(id: $projectId) {
            id
            analysisFramework {
                id
                filters {
                    id
                    filterType
                    key
                    properties
                    title
                    widgetType
                }
            }
       }
        organizationTypes {
            results {
                id
                title
            }
        }
        emmEntititiesOptions: __type(name: "EmmEntityType") {
            name
            enumValues {
                name
                description
            }
        }
        emmRiskFactorsOptions: __type(name: "EmmKeyRiskFactorType") {
            name
            enumValues {
                name
                description
            }
        }
        emmKeywordsOptions: __type(name: "EmmKeyWordType") {
            name
            enumValues {
                name
                description
            }
        }
        entryTypeOptions: __type(name: "EntryTagTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

function useFilterOptions(projectId: string) {
    const {
        data,
        loading,
        error,
    } = useQuery<SourceFilterOptions, SourceFilterOptionsQueryVariables>(
        SOURCE_FILTER_OPTIONS,
        {
            variables: {
                projectId,
            },
        },
    );

    const statusOptions = data?.sourceStatusOptions?.enumValues;
    const priorityOptions = data?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = data?.sourceConfidentialityOptions?.enumValues;
    const organizationTypeOptions = data?.organizationTypes?.results;
    const entryTypeOptions = data?.entryTypeOptions?.enumValues;
    const frameworkFilters = data?.project?.analysisFramework?.filters;

    return {
        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasEntryOptions,
        hasAssessmentOptions,
        loading,
        error,
        entryTypeOptions,
        frameworkFilters,
    };
}

export default useFilterOptions;