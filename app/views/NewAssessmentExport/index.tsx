import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    useHistory,
    useParams,
    generatePath,
    useLocation,
} from 'react-router-dom';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    Button,
    Container,
    TextInput,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useQuery, useMutation } from '@apollo/client';
import { createSubmitHandler } from '@togglecorp/toggle-form';
import {
    IoBookmarks,
    IoCheckmark,
    IoClose,
} from 'react-icons/io5';

import {
    FRAMEWORK_FRAGMENT,
} from '#gqlFragments';
import routes from '#base/configs/routes';
import StatsInformationCard from '#components/StatsInformationCard';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import ProjectContext from '#base/context/ProjectContext';
import _ts from '#ts';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';

import {
    FormType as FilterFormType,
    PartialFormType,
} from '#components/leadFilters/SourcesFilter/schema';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import { useFilterState, getProjectSourcesQueryVariables } from '#components/leadFilters/SourcesFilter';
import { transformRawFiltersToFormValues } from '#components/leadFilters/SourcesFilter/utils';
import SourcesAppliedFilters from '#components/leadFilters/SourcesAppliedFilters';

import { ExportItem } from '#views/Export/ExportHistory';

import {
    CreateExportMutation,
    CreateExportMutationVariables,
    ProjectSourceStatsForExportQuery,
    ProjectSourceStatsForExportQueryVariables,
    LeadsFilterDataInputType,
    AssessmentExportFrameworkDetailsQuery,
    AssessmentExportFrameworkDetailsQueryVariables,
} from '#generated/types';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';

import SourcesSelection from '#views/Export/SourcesSelection';
import ExportPreviewModal from '#views/Export/ExportPreviewModal';
import { CREATE_EXPORT, PROJECT_SOURCE_STATS_FOR_EXPORT } from '#views/Export/queries';

import styles from './styles.css';

type ExportStateData = Pick<ExportItem, 'filters' | 'filtersData'>

// FIXME: use from utils
interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const hasEntryOptions: BooleanOption[] = [
    { key: 'true', value: 'Has entry' },
    { key: 'false', value: 'No entries' },
];

const hasAssessmentOptions: BooleanOption[] = [
    { key: 'true', value: 'Assessment completed' },
    { key: 'false', value: 'Assessment not completed' },
];

export const PROJECT_FRAMEWORK_DETAILS = gql`
    ${FRAMEWORK_FRAGMENT}
    query AssessmentExportFrameworkDetails($projectId: ID!) {
        project(id: $projectId) {
            id
            analysisFramework {
                filters {
                    id
                    key
                    properties
                    title
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                    filterType
                    filterTypeDisplay
                }
                # NOTE: Does not need predictionTagsMapping from FrameworkResponse
                ...FrameworkResponse
            }
        }
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
        organizationTypes {
            results {
                id
                title
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

interface Props {
    className?: string;
}

function NewAssessmentExport(props: Props) {
    const { className } = props;

    const {
        projectId,
    } = useParams<{ projectId: string }>();
    const history = useHistory();
    const { state }: { state: ExportStateData | undefined } = useLocation();

    const [queryTitle, setQueryTitle] = useState<string | undefined>();
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);

    const [
        previewModalShown,
        showPreviewModal,
        hidePreviewModal,
    ] = useModalState(false);

    const {
        value: sourcesFilterValue,
        setFieldValue: setSourcesFilterFieldValue,
        setValue: setSourcesFilterValue,
        resetValue: clearSourcesFilterValue,
        pristine,
        validate,
        setError,
        setPristine,
    } = useFilterState();

    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    const {
        loading: frameworkGetPending,
        data: frameworkResponse,
    } = useQuery<
        AssessmentExportFrameworkDetailsQuery,
        AssessmentExportFrameworkDetailsQueryVariables
    >(
        PROJECT_FRAMEWORK_DETAILS,
        {
            variables: {
                projectId,
            },
            onCompleted: (response) => {
                const analyticalFramework = response.project?.analysisFramework;
                // NOTE: Let's also check for errors
                if (!analyticalFramework) {
                    return;
                }

                const filters = transformRawFiltersToFormValues(
                    state?.filters,
                    analyticalFramework?.filters as (FrameworkFilterType[] | null | undefined),
                );
                setSourcesFilterValue(filters);
                setSourcesFilters(filters);
            },
        },
    );

    const statusOptions = frameworkResponse
        ?.sourceStatusOptions?.enumValues;
    const priorityOptions = frameworkResponse
        ?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = frameworkResponse
        ?.sourceConfidentialityOptions?.enumValues;
    // FIXME: this may be problematic in the future
    const organizationTypeOptions = frameworkResponse
        ?.organizationTypes?.results;
    const entryTypeOptions = frameworkResponse
        ?.entryTypeOptions?.enumValues;
    const frameworkFilters = (frameworkResponse
        ?.project?.analysisFramework?.filters) as (FrameworkFilterType[] | null | undefined);
    const finalFilters = useMemo(() => (
        getProjectSourcesQueryVariables(
            sourcesFilters as Omit<FilterFormType, 'projectId'>,
        )
    ), [sourcesFilters]);

    const {
        data: sourcesStats,
    } = useQuery<ProjectSourceStatsForExportQuery, ProjectSourceStatsForExportQueryVariables>(
        PROJECT_SOURCE_STATS_FOR_EXPORT,
        {
            variables: {
                projectId,
                filters: finalFilters as LeadsFilterDataInputType,
            },
        },
    );

    const handleSubmit = useCallback((values: PartialFormType) => {
        setSourcesFilters(values);
        setPristine(true);
    }, [setPristine]);

    const handleApply = useCallback(() => {
        setSelectedLeads([]);
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleClear = useCallback(() => {
        setSelectedLeads([]);
        clearSourcesFilterValue();
        setSourcesFilters({});
        setPristine(true);
    }, [clearSourcesFilterValue, setPristine]);

    const { project } = useContext(ProjectContext);

    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const alert = useAlert();

    const [
        createdByOptions,
        setCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        assigneeOptions,
        setAssigneeOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const sourcesFilterContextValue = useMemo(() => ({
        createdByOptions,
        setCreatedByOptions,
        assigneeOptions,
        setAssigneeOptions,
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
        entryCreatedByOptions,
        setEntryCreatedByOptions,
        geoAreaOptions,
        setGeoAreaOptions,

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasAssessmentOptions,
        hasEntryOptions,
        entryTypeOptions,
        frameworkFilters,
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        entryTypeOptions,
        frameworkFilters,
    ]);

    const [
        createExport,
        {
            data: createExportData,
            loading: createExportPending,
        },
    ] = useMutation<CreateExportMutation, CreateExportMutationVariables>(
        CREATE_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportCreate?.ok) {
                    if (response.project.exportCreate.result?.isPreview) {
                        showPreviewModal();
                    } else {
                        history.replace(generatePath(routes.export.path, { projectId }), 'export-assessment-history');
                        alert.show(
                            _ts('export', 'exportStartedNotifyMessage'),
                            { variant: 'success' },
                        );
                    }
                }
            },
            onError: () => {
                alert.show(
                    'Error during export.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const startExport = useCallback((preview: boolean) => {
        const data = {
            exportType: 'EXCEL' as const,
            format: 'XLSX' as const,
            isPreview: preview,
            type: 'ASSESSMENTS' as const,
            filters: {
                ...getProjectSourcesQueryVariables(sourcesFilters as Omit<FilterFormType, 'projectId'>),
                ids: selectedLeads,
                excludeProvidedLeadsId: selectAll,
            },
            title: queryTitle,
        };

        createExport({
            variables: {
                projectId,
                data,
            },
        });
    }, [
        createExport,
        projectId,
        sourcesFilters,
        selectedLeads,
        selectAll,
        queryTitle,
    ]);

    const handleCreateExport = useCallback(() => {
        startExport(false);
    }, [startExport]);

    /* NOTE: Planned assessment is not needed right now
    const handlePlannedAssessmentExportClick = useCallback(() => {
        startExport(false, 'PLANNED_ASSESSMENTS');
    }, [startExport]);
    */

    const handlePreviewClick = useCallback(() => {
        startExport(true);
    }, [startExport]);

    const stats = sourcesStats?.project?.stats;
    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(sourcesFilters, ['', null])
    ), [sourcesFilters]);

    return (
        <div className={_cs(styles.newAssessmentExport, className)}>
            <SubNavbar
                className={styles.header}
                heading="New Assessment Export"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            Close
                        </BackLink>
                        <Button
                            name="showPreview"
                            variant="secondary"
                            disabled={frameworkGetPending}
                            onClick={handlePreviewClick}
                        >
                            Show Preview
                        </Button>
                        <Button
                            disabled={frameworkGetPending || createExportPending}
                            onClick={handleCreateExport}
                            variant="primary"
                            name="startExport"
                        >
                            Start Export
                        </Button>
                    </>
                )}
            />
            <div className={styles.content}>
                <Container
                    className={styles.topBar}
                    contentClassName={styles.topBarContent}
                >
                    <TextInput
                        className={styles.titleInput}
                        name="queryTitle"
                        value={queryTitle}
                        onChange={setQueryTitle}
                        label="Export Title"
                    />
                    {previewModalShown && createExportData?.project?.exportCreate?.result?.id && (
                        <ExportPreviewModal
                            projectId={projectId}
                            exportId={createExportData.project.exportCreate.result.id}
                            onCloseButtonClick={hidePreviewModal}
                        />
                    )}
                </Container>
                <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                    <div className={styles.midBar}>
                        <div className={styles.statsContainer}>
                            <StatsInformationCard
                                icon={(
                                    <IoBookmarks />
                                )}
                                label="Sources"
                                filteredValue={stats?.filteredNumberOfLeads ?? undefined}
                                totalValue={stats?.numberOfLeads ?? 0}
                                isFiltered={!isFilterEmpty}
                                variant="accent"
                            />
                        </div>
                        <SourcesAppliedFilters
                            className={styles.appliedFilters}
                            value={sourcesFilterValue}
                            onChange={setSourcesFilterFieldValue}
                        />
                        {!(isFilterEmpty && pristine) && (
                            <div className={styles.buttons}>
                                <Button
                                    disabled={pristine}
                                    name="sourcesFilterSubmit"
                                    icons={(
                                        <IoCheckmark />
                                    )}
                                    variant="tertiary"
                                    onClick={handleApply}
                                >
                                    {_ts('sourcesFilter', 'apply')}
                                </Button>
                                <Button
                                    disabled={isFilterEmpty}
                                    name="clearFilter"
                                    icons={(
                                        <IoClose />
                                    )}
                                    variant="tertiary"
                                    onClick={handleClear}
                                >
                                    {_ts('sourcesFilter', 'clearAll')}
                                </Button>
                            </div>
                        )}
                    </div>
                    <SourcesSelection
                        className={styles.leadsTableContainer}
                        projectId={projectId}
                        filterOnlyUnprotected={filterOnlyUnprotected}
                        selectedLeads={selectedLeads}
                        onSelectLeadChange={setSelectedLeads}
                        selectAll={selectAll}
                        onSelectAllChange={setSelectAll}
                        filterValues={sourcesFilters}
                        sourcesFilterValue={sourcesFilterValue}
                        totalLeadsCount={stats?.numberOfLeads ?? 0}
                        onFilterChange={setSourcesFilterFieldValue}
                    />
                </SourcesFilterContext.Provider>
            </div>
        </div>
    );
}

export default NewAssessmentExport;
