import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    useAlert,
    TextInput,
    Button,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import {
    CreateExportMutation,
    CreateExportMutationVariables,
    SourceFilterOptionsQueryVariables,
    ExportDataTypeEnum,
} from '#generated/types';
import { generateFilename } from '#utils/common';
import ProjectContext from '#base/context/ProjectContext';
import _ts from '#ts';

import ExportPreview from '../../ExportPreview';
import LeadsSelection from '../../LeadsSelection';
import styles from './styles.css';

const CREATE_EXPORT = gql`
    mutation CreateExport(
        $projectId: ID!,
        $data: ExportCreateInputType!,
    ) {
        project(id: $projectId) {
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
    projectId: string;
}

function AssessmentsExportSelection(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const alert = useAlert();

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<string | undefined>(undefined);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, setFilterValues] = useState<Omit<SourceFilterOptionsQueryVariables, 'projectId'>>({});

    const [
        createExport,
        {
            loading: createExportPending,
        },
    ] = useMutation<CreateExportMutation, CreateExportMutationVariables>(
        CREATE_EXPORT,
        {
            refetchQueries: [
                'ProjectExports',
            ],
            onCompleted: (response) => {
                if (response?.project?.exportCreate?.ok) {
                    if (response.project.exportCreate.result?.isPreview) {
                        setPreviewId(response.project.exportCreate.result?.id);
                    } else {
                        alert.show(
                            _ts('export', 'exportStartedNotifyMessage'),
                            { variant: 'success' },
                        );
                    }
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const startExport = useCallback((preview: boolean, type: Exclude<ExportDataTypeEnum, 'ENTRIES'>) => {
        const defaultTitle = generateFilename('Assessments_Export', 'xlsx');
        const data = {
            exportType: 'EXCEL' as const,
            format: 'XLSX' as const,
            isPreview: preview,
            type,
            filters: {
                ...filterValues,
                ids: selectedLeads,
                excludeProvidedLeadsId: selectAll,
            },
            title: queryTitle ?? defaultTitle,
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
        filterValues,
        selectedLeads,
        selectAll,
        queryTitle,
    ]);

    const handleAssessmentExportClick = useCallback(() => {
        startExport(false, 'ASSESSMENTS');
    }, [startExport]);

    const handlePlannedAssessmentExportClick = useCallback(() => {
        startExport(false, 'PLANNED_ASSESSMENTS');
    }, [startExport]);

    const handlePreviewClick = useCallback(() => {
        setPreviewId(undefined);
        startExport(false, 'ASSESSMENTS');
    }, [startExport]);

    return (
        <div className={_cs(className, styles.export)}>
            <div className={styles.left}>
                <ExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    heading={(
                        <div className={styles.heading}>
                            Step 1.
                            <span className={styles.subHeading}>
                                Select source(s)
                            </span>
                        </div>
                    )}
                    defaultVisibility
                >
                    <LeadsSelection
                        className={styles.leadsTableContainer}
                        projectId={projectId}
                        filterOnlyUnprotected={filterOnlyUnprotected}
                        selectedLeads={selectedLeads}
                        onSelectLeadChange={setSelectedLeads}
                        selectAll={selectAll}
                        onSelectAllChange={setSelectAll}
                        filterValues={filterValues}
                        onFilterApply={setFilterValues}
                        hasAssessment
                    />
                </ExpandableContainer>
                <ExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    heading={(
                        <div className={styles.heading}>
                            Step 2.
                            <span className={styles.subHeading}>
                                (Optional) Save your query
                            </span>
                        </div>
                    )}
                >
                    <div className={styles.content}>
                        <TextInput
                            className={styles.queryInput}
                            name="queryTitle"
                            value={queryTitle}
                            onChange={setQueryTitle}
                            label="Query title"
                            placeholder="Query title"
                        />
                    </div>
                </ExpandableContainer>
                <Footer
                    className={styles.footer}
                    actions={(
                        <>
                            <Button
                                name="startAssessmentExport"
                                onClick={handleAssessmentExportClick}
                                disabled={createExportPending}
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </Button>
                            <Button
                                name="startPlannedAssessmentExport"
                                onClick={handlePlannedAssessmentExportClick}
                                disabled={createExportPending || true}
                            >
                                {_ts('export', 'startPlannedAssessmentExportButtonLabel')}
                            </Button>
                        </>
                    )}
                />
            </div>
            <ExportPreview
                className={styles.preview}
                exportId={previewId}
                onPreviewClick={handlePreviewClick}
            />
        </div>
    );
}

export default AssessmentsExportSelection;
