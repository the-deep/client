import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    useAlert,
    TextInput,
    Button,
    ExpandableContainer,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import { useLazyRequest } from '#base/utils/restRequest';
import _ts from '#ts';
import {
    SourceFilterOptionsQueryVariables,
} from '#generated/types';
import ExportPreview from '../../ExportPreview';
import LeadsSelection from '../../LeadsSelection';
import styles from './styles.css';

interface ExportItem {
    assessment: string;
    plannedAssessment: string;
}

const exportItems: ExportItem = {
    assessment: 'assessment',
    plannedAssessment: 'planned_assessment',
};

interface ExportTriggerResponse {
    exportTriggered: number;
}

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
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('CREATE_UNPROTECTED');

    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, setFilterValues] = useState<Omit<SourceFilterOptionsQueryVariables, 'projectId'>>({});

    const {
        pending: exportPending,
        trigger: getExport,
    } = useLazyRequest<ExportTriggerResponse, { preview: boolean, type: string }>({
        url: 'server://export-trigger/',
        method: 'POST',
        body: (ctx) => ({
            filters: {
                project: projectId,
                include_leads: !selectAll,
                export_type: 'excel',
                pdf: false,
                export_item: ctx.type,
                is_preview: ctx.preview,
                lead: selectedLeads,
                ...filterValues,
            },
        }),
        onSuccess: (response, ctx) => {
            if (ctx.preview) {
                setPreviewId(response.exportTriggered);
            }
            alert.show(
                _ts('export', 'exportStartedNotifyMessage'),
                { variant: 'success' },
            );
        },
        failureHeader: _ts('export', 'headerExport'),
    });

    const handleAssessmentExportClick = useCallback(() => {
        getExport({ preview: false, type: exportItems.assessment });
    }, [getExport]);

    const handlePlannedAssessmentExportClick = useCallback(() => {
        getExport({ preview: false, type: exportItems.plannedAssessment });
    }, [getExport]);

    const handlePreviewClick = useCallback(() => {
        setPreviewId(undefined);
        getExport({ preview: true, type: exportItems.assessment });
    }, [getExport]);

    const handleSaveAndExport = () => {
        console.warn('Clicked on save and export');
    }; // TODO add this feature later

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
                        <Button
                            name="startExport"
                            variant="tertiary"
                            onClick={handleSaveAndExport}
                            className={styles.saveAndExport}
                            disabled
                        >
                            Save & Export
                        </Button>
                    </div>
                </ExpandableContainer>
                <Footer
                    className={styles.footer}
                    actions={(
                        <>
                            <Button
                                name="startAssessmentExport"
                                onClick={handleAssessmentExportClick}
                                disabled={exportPending}
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </Button>
                            <Button
                                name="startPlannedAssessmentExport"
                                onClick={handlePlannedAssessmentExportClick}
                                disabled={exportPending}
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
