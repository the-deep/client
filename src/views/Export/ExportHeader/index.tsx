import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Cloak from '#components/general/Cloak';

import {
    pathNames,
    viewsAcl,
} from '#constants';
import { processEntryFilters } from '#entities/entries';
import useRequest from '#utils/request';
import _ts from '#ts';
import notify from '#notify';

import {
    ReportStructure,
    TreeSelectableWidget,
} from '#typings';

import styles from './styles.scss';

interface ExportReportStructure {
    id: string;
    levels?: ExportReportStructure[];
}

interface ReportStructureLevel {
    id: string;
    title: string;
    sublevels?: ReportStructureLevel[];
}

const EXPORT_CLASS = {
    assessmentExport: 'assessment-export',
    entriesExport: 'entries-export',
    entriesPreview: 'entries-preview',
};

interface ExportItem {
    assessment: string;
    plannedAssessment: string;
    entry: string;
}

const exportItems: ExportItem = {
    assessment: 'assessment',
    plannedAssessment: 'planned_assessment',
    entry: 'entry',
};

interface SelectedLeads {
    [key: number]: boolean;
}

interface ExportTriggerResponse {
    exportTriggered: number;
}

interface ComponentProps {
    className?: string;
    reportStructure: ReportStructure[];
    textWidgets: TreeSelectableWidget<string | number>[];
    contextualWidgets: TreeSelectableWidget<string | number>[];
    activeExportTypeKey: string;
    decoupledEntries: boolean;
    projectId: number;
    entriesFilters: unknown;
    analysisFramework: unknown;
    geoOptions?: unknown;
    selectedLeads: SelectedLeads;
    onPreview: (v: number | undefined) => void;
    pending: boolean;
    showGroups: boolean;
}


const createReportStructureForExport = (nodes: ReportStructure[]): ExportReportStructure[] =>
    nodes
        .filter(node => node.selected)
        .map(node => ({
            id: node.key,
            levels: node.nodes
                ? createReportStructureForExport(node.nodes)
                : undefined,
        }));

const createReportStructureLevelForExport = (nodes: ReportStructure[]): ReportStructureLevel[] =>
    nodes
        .filter(node => node.selected)
        .map(node => ({
            id: node.key,
            title: node.title,
            sublevels: node.nodes
                ? createReportStructureLevelForExport(node.nodes)
                : undefined,
        }));

const createWidgetIds = (widgets: TreeSelectableWidget<string | number>[]) => (
    widgets
        .filter(widget => widget.selected)
        .map((widget) => {
            if (widget.isConditional) {
                return ([
                    widget.conditionalId,
                    widget.id,
                    widget.actualTitle,
                ]);
            }
            return widget.id;
        })
);

function ExportHeader(props: ComponentProps) {
    const {
        onPreview,
        className,
        pending,
        projectId,
        entriesFilters = {},
        activeExportTypeKey,
        selectedLeads,
        reportStructure,
        decoupledEntries,
        analysisFramework,
        geoOptions = {},
        textWidgets,
        contextualWidgets,
        showGroups,
    } = props;

    const [exportClass, setExportClass] = useState<string>();
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [exportItem, setExportItem] = useState<string>();
    const [filters, setFilters] = useState<unknown>();

    const [
        exportPending,
        ,
        ,
        getExport,
    ] = useRequest<ExportTriggerResponse>({
        url: 'server://export-trigger/',
        method: 'POST',
        body: { filters },
        onSuccess: (response) => {
            if (isPreview) {
                onPreview(response.exportTriggered);
            } else if (exportItem === exportItems.entry) {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
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
        const isWord = activeExportTypeKey === 'word';
        const isPdf = activeExportTypeKey === 'pdf';

        const exportType = (
            (item === exportItems.assessment && 'excel')
            || (item === exportItems.plannedAssessment && 'excel')
            || ((isWord || isPdf) && 'report')
            || activeExportTypeKey
        );
        // NOTE: structure and level depict the same thing but are different in structure
        // levels require the sublevels to be named sublevels whereas structure requires
        // sublevels to be names levels
        // This cannot be fixed immediately in server as it requires migration
        const reportLevels = createReportStructureLevelForExport(reportStructure)
            .map(node => ({
                id: node.id,
                levels: node.sublevels,
            }));
        const newReportStructure = createReportStructureForExport(reportStructure);
        console.warn('newReportStructure', newReportStructure);
        const textWidgetIds = createWidgetIds(textWidgets);
        let contextualWidgetIds;
        if (isWord || isPdf) {
            contextualWidgetIds = createWidgetIds(contextualWidgets);
        }

        const otherFilters = {
            project: projectId,
            lead: Object.entries(selectedLeads).reduce((acc: string[], [key, value]) => {
                if (value) return [...acc, key];
                return acc;
            }, []),

            export_type: exportType,
            // NOTE: export_type for 'word' and 'pdf' is report so, we need to differentiate
            pdf: isPdf,

            // for excel
            decoupled: decoupledEntries,

            // for pdf or word
            report_levels: reportLevels,
            report_structure: newReportStructure,
            text_widget_ids: textWidgetIds,
            show_groups: showGroups,

            // entry or assessment
            export_item: item,

            // temporary or permanent
            is_preview: preview,

            // for word
            exporting_widgets: contextualWidgetIds,
        };

        const processedFilters = processEntryFilters(
            entriesFilters,
            analysisFramework,
            geoOptions,
        );

        const newFilters = [
            ...Object.entries(otherFilters),
            ...processedFilters,
        ];

        setFilters(newFilters);
        setIsPreview(preview);
        setExportItem(item);

        const newExportClass = (
            (preview && EXPORT_CLASS.entriesPreview)
            || (item === exportItems.entry && EXPORT_CLASS.entriesExport)
            || (item === exportItems.assessment && EXPORT_CLASS.assessmentExport)
            || undefined
        );
        setExportClass(newExportClass);
        getExport();
    }, [
        activeExportTypeKey,
        analysisFramework,
        contextualWidgets,
        decoupledEntries,
        entriesFilters,
        geoOptions,
        projectId,
        reportStructure,
        selectedLeads,
        showGroups,
        textWidgets,
        getExport,
    ]);

    const handleAssessmentExportClick = useCallback(() => {
        startExport(false, exportItems.assessment);
    }, [startExport]);

    const handlePlannedAssessmentExportClick = useCallback(() => {
        startExport(false, exportItems.plannedAssessment);
    }, [startExport]);

    const handleEntryExport = useCallback(() => {
        startExport(false, exportItems.entry);
    }, [startExport]);

    const handleEntryPreview = useCallback(() => {
        onPreview(undefined);
        startExport(true, exportItems.entry);
    }, [onPreview, startExport]);

    return (
        <header className={_cs(styles.header, className)}>
            <h2>
                {_ts('export', 'headerExport')}
            </h2>
            <div className={styles.actionButtons}>
                <Link
                    to={reverseRoute(pathNames.userExports, { projectId })}
                    className={styles.link}
                >
                    {_ts('export', 'viewAllExportsButtonLabel')}
                </Link>
                <Button
                    className={styles.button}
                    onClick={handleEntryPreview}
                    disabled={pending}
                    pending={exportPending && exportClass === EXPORT_CLASS.entriesPreview}
                >
                    {_ts('export', 'showPreviewButtonLabel')}
                </Button>
                <PrimaryButton
                    className={styles.button}
                    onClick={handleEntryExport}
                    disabled={pending}
                    pending={exportPending && exportClass === EXPORT_CLASS.entriesExport}
                >
                    {_ts('export', 'startExportButtonLabel')}
                </PrimaryButton>
                <Cloak
                // NOTE: this is temporary, will be moved to new page
                    {...viewsAcl.arys}
                    render={
                        <PrimaryButton
                            className={styles.button}
                            onClick={handleAssessmentExportClick}
                            disabled={pending}
                            pending={
                                exportPending && exportClass === EXPORT_CLASS.assessmentExport
                            }
                        >
                            {_ts('export', 'startAssessmentExportButtonLabel')}
                        </PrimaryButton>
                    }
                />
                <Cloak
                // NOTE: this is temporary, will be moved to new page
                    {...viewsAcl.arys}
                    render={
                        <PrimaryButton
                            className={styles.button}
                            onClick={handlePlannedAssessmentExportClick}
                            disabled={pending}
                            pending={
                                exportPending && exportClass === EXPORT_CLASS.assessmentExport
                            }
                        >
                            {_ts('export', 'startPlannedAssessmentExportButtonLabel')}
                        </PrimaryButton>
                    }
                />
            </div>
        </header>
    );
}

export default ExportHeader;
