import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    TextInput,
    Button,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import notify from '#notify';
import { useLazyRequest } from '#utils/request';

import { SourceEntryFilter } from '../../types';
import ExportPreview from '../../ExportPreview';
import LeadsSelection from '../../LeadsSelection';
import styles from './styles.scss';

const EXPORT_CLASS = {
    assessmentExport: 'assessment-export',
    plannedAryExport: 'entries-export',
    assessmentPreview: 'entries-preview',
};

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
    projectRole: {
        exportPermissions?: {
            'create_only_unprotected'?: boolean;
        };
    };
    projectId: number;
}

function AssessmentsExportSelection(props: Props) {
    const {
        className,
        projectId,
        projectRole,
    } = props;

    const filterOnlyUnprotected = !!projectRole?.exportPermissions?.create_only_unprotected;
    const [exportClass, setExportClass] = useState<string>();
    const [queryTitle, setQueryTitle] = useState<string>();
    const [exportItem, setExportItem] = useState<string>();
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, setFilterValues] = useState<SourceEntryFilter>({});

    const {
        pending: exportPending,
        trigger: getExport,
    } = useLazyRequest<ExportTriggerResponse, unknown>({
        url: 'server://export-trigger/',
        method: 'POST',
        body: ctx => ({ filters: ctx }),
        onSuccess: (response) => {
            if (isPreview) {
                setPreviewId(response.exportTriggered);
            } else if (exportItem === exportItems.assessment) {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
            }

            setExportClass(undefined);
        },
        failureHeader: _ts('export', 'headerExport'),
    });

    const startExport = useCallback((preview: boolean, item: string) => {
        const filters = {
            project: projectId,
            include_leads: !selectAll,
            lead: selectedLeads,


            export_type: 'excel',
            // NOTE: export_type for 'word' and 'pdf' is report so, we need to differentiate
            pdf: false,

            // entry or assessment
            export_item: item,

            // temporary or permanent
            is_preview: preview,
            ...filterValues,
        };

        setIsPreview(preview);
        setExportItem(item);

        const newExportClass = (
            (preview && EXPORT_CLASS.assessmentPreview)
            || (item === exportItems.plannedAssessment && EXPORT_CLASS.plannedAryExport)
            || (item === exportItems.assessment && EXPORT_CLASS.assessmentExport)
            || undefined
        );
        setExportClass(newExportClass);
        getExport(filters);
    }, [
        selectAll,
        selectedLeads,
        projectId,
        getExport,
        filterValues,
    ]);

    const handleAssessmentExportClick = useCallback(() => {
        startExport(false, exportItems.assessment);
    }, [startExport]);

    const handlePlannedAssessmentExportClick = useCallback(() => {
        startExport(false, exportItems.plannedAssessment);
    }, [startExport]);

    const handlePreviewClick = useCallback(() => {
        setPreviewId(undefined);
        startExport(true, exportItems.assessment);
    }, [startExport]);

    const handleSaveAndExport = () => {}; // TODO add this feature later

    return (
        <div className={_cs(className, styles.export)}>
            <div className={styles.left}>
                <ExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    sub
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
                    sub
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
                                disabled={
                                    exportPending || exportClass === EXPORT_CLASS.assessmentExport
                                }
                            >
                                {_ts('export', 'startAssessmentExportButtonLabel')}
                            </Button>
                            <Button
                                name="startPlannedAssessmentExport"
                                onClick={handlePlannedAssessmentExportClick}
                                disabled={
                                    exportPending || exportClass === EXPORT_CLASS.assessmentExport
                                }
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
