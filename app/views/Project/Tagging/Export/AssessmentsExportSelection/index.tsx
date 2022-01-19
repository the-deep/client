import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    useAlert,
    TextInput,
    Button,
    ControlledExpandableContainer,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import {
    CreateExportMutation,
    CreateExportMutationVariables,
    SourceFilterOptionsQueryVariables,
    ExportDataTypeEnum,
} from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';
import _ts from '#ts';

import ExportPreview from '../ExportPreview';
import LeadsSelection from '../LeadsSelection';

import styles from './styles.css';

const CREATE_EXPORT = gql`
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
    projectId: string;
    onSuccess: () => void;
}

function AssessmentsExportSelection(props: Props) {
    const {
        className,
        projectId,
        onSuccess,
    } = props;

    const alert = useAlert();

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const [queryTitle, setQueryTitle] = useState<string | undefined>();
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
                if (response.project?.exportCreate?.ok) {
                    if (response.project.exportCreate.result?.isPreview) {
                        setPreviewId(response.project.exportCreate.result.id);
                    } else {
                        alert.show(
                            _ts('export', 'exportStartedNotifyMessage'),
                            { variant: 'success' },
                        );
                        onSuccess();
                    }
                } else {
                    alert.show(
                        'Error during export.',
                        {
                            variant: 'error',
                        },
                    );
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

    const startExport = useCallback((preview: boolean, type: Exclude<ExportDataTypeEnum, 'ENTRIES'>) => {
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
        filterValues,
        selectedLeads,
        selectAll,
        queryTitle,
    ]);

    const handleAssessmentExportClick = useCallback(() => {
        startExport(false, 'ASSESSMENTS');
    }, [startExport]);

    /* NOTE: Planned assessment is not needed right now
    const handlePlannedAssessmentExportClick = useCallback(() => {
        startExport(false, 'PLANNED_ASSESSMENTS');
    }, [startExport]);
    */

    const handlePreviewClick = useCallback(() => {
        setPreviewId(undefined);
        startExport(true, 'ASSESSMENTS');
    }, [startExport]);

    const [expandedStep, setExpandedStep] = useState<'step1' | 'step2' | undefined>('step1');

    const handleStepExpansionChange = useCallback((newState: boolean, step: 'step1' | 'step2') => {
        setExpandedStep(newState ? step : undefined);
    }, []);

    return (
        <div className={_cs(className, styles.export)}>
            <div className={styles.left}>
                <ControlledExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    headerClassName={styles.header}
                    headingClassName={styles.heading}
                    heading={(
                        <div className={styles.heading}>
                            Step 1.
                            <span className={styles.subHeading}>
                                Select source(s)
                            </span>
                        </div>
                    )}
                    name="step1"
                    expanded={expandedStep === 'step1'}
                    onExpansionChange={handleStepExpansionChange}
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
                </ControlledExpandableContainer>
                <ControlledExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    headerClassName={styles.header}
                    headingClassName={styles.heading}
                    heading={(
                        <div className={styles.heading}>
                            Step 2.
                            <span className={styles.subHeading}>
                                (Optional) Save your query
                            </span>
                        </div>
                    )}
                    name="step2"
                    expanded={expandedStep === 'step2'}
                    onExpansionChange={handleStepExpansionChange}
                >
                    <TextInput
                        name="queryTitle"
                        value={queryTitle}
                        onChange={setQueryTitle}
                        label="Assessment export title"
                        placeholder="Assessment export title"
                    />
                </ControlledExpandableContainer>
                <Footer
                    actions={(
                        <>
                            <Button
                                name="startAssessmentExport"
                                onClick={handleAssessmentExportClick}
                                disabled={createExportPending}
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </Button>
                            {/*
                            <Button
                                name="startPlannedAssessmentExport"
                                onClick={handlePlannedAssessmentExportClick}
                                disabled
                            >
                                {_ts('export', 'startPlannedAssessmentExportButtonLabel')}
                            </Button>
                            */}
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
