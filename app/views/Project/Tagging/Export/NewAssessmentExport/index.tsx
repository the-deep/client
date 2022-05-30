import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    useHistory,
    useParams,
    generatePath,
} from 'react-router-dom';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    Button,
    Container,
    TextInput,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import { useQuery, gql, useMutation } from '@apollo/client';
import { createSubmitHandler } from '@togglecorp/toggle-form';
import {
    IoBookmarks,
} from 'react-icons/io5';

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
} from '#views/Project/Tagging/Sources/SourcesFilter/schema';
import AppliedFilters from '#views/Project/Tagging/Sources/AppliedFilters';
import SourcesFilterContext from '#views/Project/Tagging/Sources/SourcesFilterContext';
import { useFilterState, getProjectSourcesQueryVariables } from '#views/Project/Tagging/Sources/SourcesFilter';

import {
    CreateExportMutation,
    CreateExportMutationVariables,
    ProjectSourceStatsForExportQuery,
    ProjectSourceStatsForExportQueryVariables,
    LeadsFilterDataInputType,
} from '#generated/types';

import SourcesSelection from '../SourcesSelection';
import ExportPreviewModal from '../ExportPreviewModal';
import { CREATE_EXPORT } from '../queries';

import styles from './styles.css';

const PROJECT_SOURCE_STATS_FOR_EXPORT = gql`
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

interface Props {
    className?: string;
}

function NewAssessmentExport(props: Props) {
    const { className } = props;

    const {
        projectId,
    } = useParams<{ projectId: string }>();
    const history = useHistory();

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
        setFieldValue: setSourcesFilterValue,
        resetValue: clearSourcesFilterValue,
        pristine,
        validate,
        setError,
        setPristine,
    } = useFilterState();

    const [
        sourcesFilter,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    const {
        data: sourcesStats,
    } = useQuery<ProjectSourceStatsForExportQuery, ProjectSourceStatsForExportQueryVariables>(
        PROJECT_SOURCE_STATS_FOR_EXPORT,
        {
            variables: {
                projectId,
                filters: sourcesFilter as LeadsFilterDataInputType,
            },
        },
    );

    const handleSubmit = useCallback((values: PartialFormType) => {
        setSourcesFilters(values);
        setPristine(true);
    }, [setPristine]);

    const handleApply = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleClear = useCallback(() => {
        setPristine(true);
        clearSourcesFilterValue();
        setSourcesFilters({});
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
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,
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
                ...getProjectSourcesQueryVariables(sourcesFilter as Omit<FilterFormType, 'projectId'>),
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
        sourcesFilter,
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
        doesObjectHaveNoData(sourcesFilter, [''])
    ), [sourcesFilter]);

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
                            onClick={handlePreviewClick}
                        >
                            Show Preview
                        </Button>
                        <Button
                            disabled={createExportPending}
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
                        <AppliedFilters
                            className={styles.appliedFilters}
                            projectId={projectId}
                            value={sourcesFilter}
                            onChange={setSourcesFilterValue}
                        />
                        {!(isFilterEmpty && pristine) && (
                            <div className={styles.buttons}>
                                <Button
                                    disabled={pristine}
                                    name="sourcesFilterSubmit"
                                    variant="action"
                                    onClick={handleApply}
                                >
                                    {_ts('sourcesFilter', 'apply')}
                                </Button>
                                <Button
                                    disabled={isFilterEmpty}
                                    name="clearFilter"
                                    variant="action"
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
                        filterValues={sourcesFilter}
                        sourcesFilterValue={sourcesFilterValue}
                        onFilterChange={setSourcesFilterValue}
                    />
                </SourcesFilterContext.Provider>
            </div>
        </div>
    );
}

export default NewAssessmentExport;
