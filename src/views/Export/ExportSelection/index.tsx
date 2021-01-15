import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import { processEntryFilters } from '#entities/entries';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TreeSelection from '#rsci/TreeSelection';
import Button from '#rsca/Button';
import ExportPreview from '#components/other/ExportPreview';

import {
    projectDetailsSelector,
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
    entryFilterOptionsForProjectSelector,
} from '#redux';

import {
    SECTOR_FIRST,
    createReportStructure,
    getContextualWidgetsFromFramework,
    getTextWidgetsFromFramework,
} from '#utils/framework';
import useRequest from '#utils/request';

import { notifyOnFailure } from '#utils/requestNotify';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';
import notify from '#notify';

import {
    AppState,
    FrameworkFields,
    Lead,
    ExportType,
    TreeSelectableWidget,
    ReportStructure,
} from '#typings';

import LeadsSelection from './LeadsSelection';
import ExportTypePane from '../ExportTypePane';

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

interface PropsFromDispatch {
    setAnalysisFramework: typeof setAnalysisFrameworkAction;
    setGeoOptions: typeof setGeoOptionsAction;
}

interface ExportTriggerResponse {
    exportTriggered: number;
}

const mapStateToProps = (state: AppState) => ({
    analysisFramework: analysisFrameworkForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

export interface SelectedLead extends Lead {
    selected: boolean;
}

interface PropsFromState {
    projectRole: {
        exportPermissions?: {
            'create_only_unprotected'?: boolean;
        };
    };
    analysisFramework: FrameworkFields;
    entriesFilters: unknown;
    entryFilterOptions: {
        projectEntryLabel: [];
    };
    geoOptions: unknown;
    projectDetails: {
        regions: unknown[];
    };
}

interface OwnProps {
    projectId: number;
}

type Props = OwnProps &PropsFromState & PropsFromDispatch;

function EntriesExportSelection(props: Props) {
    const {
        analysisFramework,
        entriesFilters,
        projectId,
        geoOptions,
        entryFilterOptions,
        projectRole,
        setAnalysisFramework,
        setGeoOptions,
        projectDetails,
    } = props;

    const {
        filters,
        widgets,
    } = analysisFramework;

    const filterOnlyUnprotected = !!projectRole?.exportPermissions?.['create_only_unprotected'];
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string | number>[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<ReportStructure[]>([]);
    // const [leads, setLeads] = useState<SelectedLead[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [filtersToExport, setFiltersToExport] = useState<unknown>();
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

    const [
        showSourceSelect,
        setSectorSelectVisible,
        setSectorSelectHidden,
    ] = useModalState(true);
    const [
        showFormatSelect,
        setFormatSelectVisible,
        setFormatSelectHidden,
    ] = useModalState(false);
    const [
        showFrameworkSections,
        setFrameworkSectionsVisible,
        setFrameworkSectionsHidden,
    ] = useModalState(false);

    const [
        reportStructureVariant,
        setReportStructureVariant,
    ] = useState<string>(SECTOR_FIRST);
    const [
        contextualWidgets,
        setContextualWidgets,
    ] = useState<TreeSelectableWidget<string | number>[]>([]);

    const [
        analysisFrameworkPending,
    ] = useRequest<unknown>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        schemaName: 'analysisFramework',
        autoTrigger: true,
        onSuccess: (response) => {
            setAnalysisFramework({ analysisFramework: response });
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'afLabel'))({ error: errorBody });
        },
    });

    const geoOptionsRequestQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const [
        geoOptionsPending,
    ] = useRequest<unknown>({
        url: 'server://geo-options/',
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        autoTrigger: true,
        onSuccess: (response) => {
            setGeoOptions({ projectId, locations: response });
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'geoLabel'))({ error: errorBody });
        },
    });

    useEffect(() => {
        setActiveExportTypeKey('word');
        setPreviewId(undefined);
        setReportStructure([]);
        setDecoupledEntries(true);
    }, [projectId, setPreviewId]);

    useEffect(() => {
        const textWidgetList = getTextWidgetsFromFramework(analysisFramework);
        const contextualWidgetList = getContextualWidgetsFromFramework(analysisFramework);
        setTextWidgets(textWidgetList);
        setContextualWidgets(contextualWidgetList);
    }, [analysisFramework]);

    useEffect(() => {
        const structure = createReportStructure(
            analysisFramework,
            reportStructureVariant,
            includeSubSector,
        );
        setReportStructure(structure);
    }, [analysisFramework, reportStructureVariant, includeSubSector]);

    const handleReportStructureVariantChange = useCallback((value: string) => {
        setReportStructureVariant(value);
    }, []);

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
            } else {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
            }
        },
        onFailure: () => {
            notify.send({
                title: _ts('export', 'headerExport'),
                type: notify.type.ERROR,
                message: _ts('export', 'exportFailedNotifyMessage'),
                duration: 15000,
            });
        },
    });

    const startExport = useCallback((preview: boolean) => {
        const isWord = activeExportTypeKey === 'word';
        const isPdf = activeExportTypeKey === 'pdf';

        const exportType = ((isWord || isPdf) && 'report') || activeExportTypeKey;
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
        const textWidgetIds = createWidgetIds(textWidgets);
        let contextualWidgetIds;
        if (isWord || isPdf) {
            contextualWidgetIds = createWidgetIds(contextualWidgets);
        }

        const otherFilters = {
            project: projectId,
            lead: selectedLeads,

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
            export_item: 'entry',

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

        setFiltersToExport(newFilters);
        setIsPreview(preview);

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

    const handleEntryExport = useCallback(() => {
        startExport(false);
    }, [startExport]);

    const handleEntryPreview = useCallback(() => {
        setPreviewId(undefined);
        startExport(true);
    }, [setPreviewId, startExport]);

    const pending = analysisFrameworkPending || geoOptionsPending;
    const showTextWidgetSelection = textWidgets.length > 0;
    const showContextualWidgetSelection = contextualWidgets.length > 0;

    const showMatrix2dOptions = useMemo(
        () => {
            if (pending || isNotDefined(widgets)) {
                return false;
            }
            return widgets.some((widget) => {
                if (widget.widgetId === 'matrix2dWidget') {
                    return true;
                }
                if (widget.widgetId === 'conditionalWidget') {
                    const widgetsList = (widget.properties?.data?.widgets || [])
                        .map(w => w?.widget);
                    return widgetsList.some(w => w?.widgetId === 'matrix2dWidget');
                }
                return false;
            });
        },
        [widgets, pending],
    );


    return (
        <div className={styles.export}>
            <div className={styles.left} >
                <section className={_cs(styles.section, styles.leadFilters)}>
                    <header className={styles.sectionHeader}>
                        <h3 className={styles.heading}>
                            {_ts('export', 'selectSourcesStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectSourcesHeading')}
                            </span>
                        </h3>
                        <Button
                            transparent
                            onClick={
                                showSourceSelect ? setSectorSelectHidden : setSectorSelectVisible
                            }
                            iconName={showSourceSelect ? 'chevronUp' : 'chevronDown'}
                        />
                    </header>
                    {showSourceSelect && (
                        <LeadsSelection
                            className={styles.leadsTable}
                            projectId={projectId}
                            filterOnlyUnprotected={filterOnlyUnprotected}
                            projectRegions={projectDetails.regions}
                            entriesFilters={filters}
                            entriesWidgets={widgets}
                            entriesGeoOptions={geoOptions}
                            pending={analysisFrameworkPending || geoOptionsPending}
                            setSelectedLeads={setSelectedLeads}
                        />
                    )}
                </section>
                <section className={styles.section}>
                    <header className={styles.sectionHeader}>
                        <h3 className={styles.heading}>
                            {_ts('export', 'selectFormatStylingStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectFormatStylingHeading')}
                            </span>
                        </h3>
                        <Button
                            onClick={
                                showFormatSelect ? setFormatSelectHidden : setFormatSelectVisible
                            }
                            iconName={showFormatSelect ? 'chevronUp' : 'chevronDown'}
                            transparent
                        />
                    </header>
                    {showFormatSelect && (
                        <ExportTypePane
                            activeExportTypeKey={activeExportTypeKey}
                            reportStructure={reportStructure}
                            reportStructureVariant={reportStructureVariant}
                            decoupledEntries={decoupledEntries}
                            showGroups={showGroups}
                            onExportTypeChange={setActiveExportTypeKey}
                            onReportStructureChange={setReportStructure}
                            entryFilterOptions={entryFilterOptions}
                            onShowGroupsChange={setShowGroups}
                            onReportStructureVariantChange={handleReportStructureVariantChange}
                            onDecoupledEntriesChange={setDecoupledEntries}
                            onIncludeSubSectorChange={setIncludeSubSector}
                            includeSubSector={includeSubSector}
                            showMatrix2dOptions={showMatrix2dOptions}
                        />
                    )}
                </section>
                {(activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf')
                    && (showContextualWidgetSelection || showTextWidgetSelection)
                    && (
                        <section className={styles.section}>
                            <header className={styles.sectionHeader}>
                                <h3 className={styles.heading}>
                                    {_ts('export', 'selectFrameworkSectionsStepHeading')}
                                    <span className={styles.subHeading}>
                                        {_ts('export', 'selectFrameworkSectionsHeading')}
                                    </span>
                                </h3>
                                <Button
                                    onClick={showFrameworkSections
                                        ? setFrameworkSectionsHidden
                                        : setFrameworkSectionsVisible
                                    }
                                    iconName={showFrameworkSections ? 'chevronUp' : 'chevronDown'}
                                    transparent
                                />
                            </header>
                            {showFrameworkSections && (
                                <div className={styles.sectionBody}>
                                    {showContextualWidgetSelection && (
                                        <TreeSelection
                                            label={_ts('export', 'contextualWidgetLabel')}
                                            value={contextualWidgets}
                                            onChange={setContextualWidgets}
                                            direction="horizontal"
                                        />
                                    )}
                                    {showTextWidgetSelection && (
                                        <TreeSelection
                                            label={_ts('export', 'textWidgetLabel')}
                                            value={textWidgets}
                                            onChange={setTextWidgets}
                                            direction="horizontal"
                                        />
                                    )}
                                </div>
                            )}
                        </section>
                    )
                }
                <PrimaryButton
                    className={styles.exportButton}
                    onClick={handleEntryExport}
                    disabled={pending}
                    pending={exportPending}
                >
                    {_ts('export', 'startExportButtonLabel')}
                </PrimaryButton>
            </div>
            <ExportPreview
                className={styles.preview}
                exportId={previewId}
                onPreviewClick={handleEntryPreview}
            />
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(EntriesExportSelection);
