import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    TextInput,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';

import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import ProjectContext from '#base/context/ProjectContext';
import _ts from '#ts';
import { FormType as FilterFormType } from '#views/Project/Tagging/Sources/SourcesFilter/schema';
import { useFilterState, getProjectSourcesQueryVariables } from '#views/Project/Tagging/Sources/SourcesFilter';
import {
    CreateExportMutation,
    CreateExportMutationVariables,
} from '#generated/types';

import SourcesSelection from '../SourcesSelection';
import ExportPreviewModal from '../NewExport/ExportPreviewModal';

import styles from './styles.css';

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

interface Props {
    className?: string;
}

function NewAssessmentExport(props: Props) {
    const { className } = props;

    const {
        projectId,
    } = useParams<{ projectId: string }>();

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

    const { project } = React.useContext(ProjectContext);

    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const alert = useAlert();

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
                heading="New Export"
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
                        placeholder="Export Title"
                    />
                    {previewModalShown && createExportData?.project?.exportCreate?.result?.id && (
                        <ExportPreviewModal
                            projectId={projectId}
                            exportId={createExportData.project.exportCreate.result.id}
                            onCloseButtonClick={hidePreviewModal}
                        />
                    )}
                </Container>
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
            </div>
        </div>
    );
}

export default NewAssessmentExport;
