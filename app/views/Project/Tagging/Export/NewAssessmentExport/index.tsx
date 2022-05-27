import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
    useHistory,
    useParams,
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    TextInput,
    useModalState,
    CompactInformationCard,
    useAlert,
} from '@the-deep/deep-ui';
import { useMutation } from '@apollo/client';
import {
    IoBookmarks,
    IoDocumentText,
} from 'react-icons/io5';

import routes from '#base/configs/routes';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import ProjectContext from '#base/context/ProjectContext';
import _ts from '#ts';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';

import { FormType as FilterFormType } from '#views/Project/Tagging/Sources/SourcesFilter/schema';
import AppliedFilters from '#views/Project/Tagging/Sources/AppliedFilters';
import SourcesFilterContext from '#views/Project/Tagging/Sources/SourcesFilterContext';
import { useFilterState, getProjectSourcesQueryVariables } from '#views/Project/Tagging/Sources/SourcesFilter';

import {
    CreateExportMutation,
    CreateExportMutationVariables,
} from '#generated/types';

import SourcesSelection from '../SourcesSelection';
import ExportPreviewModal from '../ExportPreviewModal';
import { CREATE_EXPORT } from '../queries';

import styles from './styles.css';

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
        value: sourcesFilter,
        setFieldValue: setSourcesFilterValue,
    } = useFilterState();

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
                            <CompactInformationCard
                                icon={<IoDocumentText />}
                                label="Entries"
                                valuePrecision={0}
                                value={200}
                            />
                            <CompactInformationCard
                                icon={<IoBookmarks />}
                                label="Sources"
                                valuePrecision={0}
                                value={200}
                            />
                        </div>
                        <AppliedFilters
                            className={styles.appliedFilters}
                            projectId={projectId}
                            value={sourcesFilter}
                            onChange={setSourcesFilterValue}
                        />
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
                        onFilterApply={setSourcesFilterValue}
                        hasAssessment
                    />
                </SourcesFilterContext.Provider>
            </div>
        </div>
    );
}

export default NewAssessmentExport;
