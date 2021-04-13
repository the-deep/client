import React, { useState, useEffect, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import ExportPreview from '#components/other/ExportPreview';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import useRequest from '#utils/request';
import notify from '#notify';
import _ts from '#ts';

import { getCombinedLeadFilters } from '#entities/lead';
import ExpandableContainer from '#dui/ExpandableContainer';

import { FaramValues } from '../ExportSelection';
import LeadsSelection from '../LeadsSelection';

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

interface OwnProps {
    className?: string;
    projectId: number;
    projectRole: {
        exportPermissions?: {
            'create_only_unprotected'?: boolean;
        };
    };
}

interface ExportTriggerResponse {
    exportTriggered: number;
}

function AssessmentExportSelection(props: OwnProps) {
    const {
        className,
        projectId,
        projectRole,
    } = props;

    const filterOnlyUnprotected = !!projectRole?.exportPermissions?.create_only_unprotected;
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [exportClass, setExportClass] = useState<string>();
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [exportItem, setExportItem] = useState<string>();
    const [filtersToExport, setFiltersToExport] = useState<unknown>();
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, onFilterChange] = useState<FaramValues>({});

    useEffect(() => {
        setPreviewId(undefined);
    }, [projectId]);

    const [
        exportPending,
        ,
        ,
        getExport,
    ] = useRequest<ExportTriggerResponse>({
        url: 'server://export-trigger/',
        method: 'POST',
        body: { filters: filtersToExport },
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
        onFailure: () => {
            setExportClass(undefined);
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.ERROR,
                message: _ts('export', 'exportFailedNotifyMessage'),
                duration: 15000,
            });
        },
    });

    const startExport = useCallback((preview: boolean, item: string) => {
        const otherFilters = {
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
        };

        const processedFilters = getCombinedLeadFilters(
            filterValues,
        );
        const newFilters = [
            ...Object.entries(otherFilters),
            ...Object.entries(processedFilters),
        ];

        setFiltersToExport(newFilters);
        setIsPreview(preview);
        setExportItem(item);

        const newExportClass = (
            (preview && EXPORT_CLASS.assessmentPreview)
            || (item === exportItems.plannedAssessment && EXPORT_CLASS.plannedAryExport)
            || (item === exportItems.assessment && EXPORT_CLASS.assessmentExport)
            || undefined
        );
        setExportClass(newExportClass);
        getExport();
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

    return (
        <div className={_cs(className, styles.exportSelection)}>
            <div className={styles.leftContainer}>
                <ExpandableContainer
                    className={styles.section}
                    heading={(
                        <h3 className={styles.heading}>
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectSourcesHeading')}
                            </span>
                        </h3>
                    )}
                    defaultVisibility
                >
                    <LeadsSelection
                        projectId={projectId}
                        filterOnlyUnprotected={filterOnlyUnprotected}
                        selectedLeads={selectedLeads}
                        onSelectLeadChange={setSelectedLeads}
                        selectAll={selectAll}
                        onSelectAllChange={setSelectAll}
                        filterValues={filterValues}
                        handleFilterValuesChange={onFilterChange}
                        hasAssessment
                    />
                </ExpandableContainer>
                <div className={styles.footer}>
                    <PrimaryButton
                        className={styles.button}
                        onClick={handleAssessmentExportClick}
                        disabled={exportPending}
                        pending={
                            exportPending && exportClass === EXPORT_CLASS.assessmentExport
                        }
                    >
                        {_ts('export', 'startAssessmentExportButtonLabel')}
                    </PrimaryButton>
                    <PrimaryButton
                        className={styles.button}
                        onClick={handlePlannedAssessmentExportClick}
                        disabled={exportPending}
                        pending={
                            exportPending && exportClass === EXPORT_CLASS.assessmentExport
                        }
                    >
                        {_ts('export', 'startPlannedAssessmentExportButtonLabel')}
                    </PrimaryButton>
                </div>
            </div>
            <ExportPreview
                className={styles.preview}
                exportId={previewId}
                onPreviewClick={handlePreviewClick}
            />
        </div>
    );
}

export default AssessmentExportSelection;
