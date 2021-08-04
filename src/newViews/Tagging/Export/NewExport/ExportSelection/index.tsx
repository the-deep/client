import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    Button,
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';

import ExportPreview from '#components/other/ExportPreview';

import {
    SECTOR_FIRST,
    createReportStructure,
    getContextualWidgetsFromFramework,
    getTextWidgetsFromFramework,
} from '#utils/framework';
import { getCombinedLeadFilters } from '#entities/lead';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';
import notify from '#notify';
import {
    FrameworkFields,
    Lead,
    ExportType,
    TreeSelectableWidget,
    ReportStructure,
    GeoOptions,
    WidgetElement,
    ConditionalWidget,
    EntryOptions,
} from '#typings';

import { SourceEntryFilter } from './types';
import LeadsSelection from './LeadsSelection';
import ExportTypePane from './ExportTypePane';

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

interface ExportTriggerResponse {
    exportTriggered: number;
}

export interface SelectedLead extends Lead {
    selected: boolean;
}
interface Props {
    projectRole: {
        exportPermissions?: {
            'create_only_unprotected'?: boolean;
        };
    };
    projectId: number;
}

function EntriesExportSelection(props: Props) {
    const {
        projectId,
        projectRole,
    } = props;

    const filterOnlyUnprotected = !!projectRole?.exportPermissions?.create_only_unprotected;
    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string | number>[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [showEntryId, setShowEntryId] = useState<boolean>(true);
    const [showAryDetails, setShowAryDetails] = useState<boolean>(true);
    const [showAdditionalMetadata, setShowAdditionalMetadata] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<ReportStructure[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, setFilterValues] = useState<SourceEntryFilter>({});

    const [
        reportStructureVariant,
        setReportStructureVariant,
    ] = useState<string>(SECTOR_FIRST);
    const [
        contextualWidgets,
        setContextualWidgets,
    ] = useState<TreeSelectableWidget<string | number>[]>([]);

    const {
        pending: analysisFrameworkPending,
        response: analysisFramework,
    } = useRequest<FrameworkFields>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        schemaName: 'analysisFramework',
        onSuccess: (response) => {
            const textWidgetList = getTextWidgetsFromFramework(response);
            const contextualWidgetList = getContextualWidgetsFromFramework(response);
            setTextWidgets(textWidgetList);
            setContextualWidgets(contextualWidgetList);
        },
        failureHeader: _ts('export', 'afLabel'),
    });

    const geoOptionsRequestQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const {
        pending: geoOptionsPending,
        response: geoOptions,
    } = useRequest<GeoOptions>({
        url: 'server://geo-options/',
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        failureHeader: _ts('export', 'geoLabel'),
    });

    const entryOptionsQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const {
        pending: entryOptionsPending,
        response: entryOptions,
    } = useRequest<EntryOptions>({
        url: 'server://entry-options/',
        query: entryOptionsQueryParams,
        method: 'GET',
        failureHeader: 'Entry Options',
    });

    useEffect(() => {
        setActiveExportTypeKey('word');
        setPreviewId(undefined);
        setReportStructure([]);
        setDecoupledEntries(false);
    }, [projectId, setPreviewId]);

    useEffect(() => {
        const structure = createReportStructure(
            reportStructureVariant,
            includeSubSector,
            analysisFramework,
        );
        setReportStructure(structure);
    }, [analysisFramework, reportStructureVariant, includeSubSector]);

    const handleReportStructureVariantChange = useCallback((value: string) => {
        setReportStructureVariant(value);
    }, []);

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
            } else {
                notify.send({
                    title: _ts('export', 'headerExport'),
                    type: notify.type.SUCCESS,
                    message: _ts('export', 'exportStartedNotifyMessage'),
                    duration: 15000,
                });
            }
        },
        failureHeader: _ts('export', 'headerExport'),
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
            include_leads: !selectAll,
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
            report_show_lead_entry_id: showEntryId,
            report_show_assessment_data: showAryDetails,
            report_show_entry_widget_data: showAdditionalMetadata,

            // temporary or permanent
            is_preview: preview,

            // for word
            exporting_widgets: contextualWidgetIds,
        };

        const processedFilters = getCombinedLeadFilters(
            filterValues,
            analysisFramework?.widgets,
            geoOptions,
        );

        const newFilters = [
            ...Object.entries(otherFilters),
            ...Object.entries(processedFilters),
        ];

        setIsPreview(preview);
        getExport(newFilters);
    }, [
        selectAll,
        activeExportTypeKey,
        contextualWidgets,
        decoupledEntries,
        geoOptions,
        projectId,
        reportStructure,
        selectedLeads,
        showGroups,
        showEntryId,
        showAryDetails,
        showAdditionalMetadata,
        textWidgets,
        getExport,
        filterValues,
        analysisFramework?.widgets,
    ]);

    const handleEntryExport = useCallback(() => {
        startExport(false);
    }, [startExport]);

    const handleEntryPreview = useCallback(() => {
        setPreviewId(undefined);
        startExport(true);
    }, [setPreviewId, startExport]);

    const requestsPending = analysisFrameworkPending || geoOptionsPending || entryOptionsPending;
    const showMatrix2dOptions = useMemo(
        () => {
            if (requestsPending || !analysisFramework || isNotDefined(analysisFramework?.widgets)) {
                return false;
            }
            return analysisFramework.widgets.some((widget: WidgetElement<unknown>) => {
                if (widget.widgetId === 'matrix2dWidget') {
                    return true;
                }
                if (widget.widgetId === 'conditionalWidget') {
                    const { properties: { data } } = widget as WidgetElement<ConditionalWidget>;
                    const widgetsList = (data?.widgets ?? [])
                        .map(w => w?.widget);
                    return widgetsList.some(w => w?.widgetId === 'matrix2dWidget');
                }
                return false;
            });
        },
        [analysisFramework, requestsPending],
    );
    const handleSaveAndExport = () => {}; // TODO add this feature later

    return (
        <div className={styles.export}>
            <div className={styles.left}>
                <ExpandableContainer
                    className={styles.section}
                    headingSize="small"
                    sub
                    heading={(
                        <div className={styles.heading}>
                            {_ts('export', 'selectSourcesStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectSourcesHeading')}
                            </span>
                        </div>
                    )}
                    defaultVisibility
                >
                    <LeadsSelection
                        projectId={projectId}
                        filterOnlyUnprotected={filterOnlyUnprotected}
                        entriesFilters={analysisFramework?.filters}
                        entriesWidgets={analysisFramework?.widgets}
                        entriesGeoOptions={geoOptions}
                        entryOptions={entryOptions}
                        pending={requestsPending}
                        selectedLeads={selectedLeads}
                        onSelectLeadChange={setSelectedLeads}
                        selectAll={selectAll}
                        onSelectAllChange={setSelectAll}
                        filterValues={filterValues}
                        onFilterApply={setFilterValues}
                    />
                </ExpandableContainer>
                <ExpandableContainer
                    className={styles.section}
                    sub
                    headingSize="small"
                    heading={(
                        <div className={styles.heading}>
                            {_ts('export', 'selectFormatStylingStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectFormatStylingHeading')}
                            </span>
                        </div>
                    )}
                >
                    <ExportTypePane
                        activeExportTypeKey={activeExportTypeKey}
                        reportStructure={reportStructure}
                        reportStructureVariant={reportStructureVariant}
                        decoupledEntries={decoupledEntries}
                        showGroups={showGroups}
                        showEntryId={showEntryId}
                        showAryDetails={showAryDetails}
                        showAdditionalMetadata={showAdditionalMetadata}
                        onExportTypeChange={setActiveExportTypeKey}
                        onReportStructureChange={setReportStructure}
                        entryFilterOptions={entryOptions}
                        onShowGroupsChange={setShowGroups}
                        onShowEntryIdChange={setShowEntryId}
                        onShowAryDetailsChange={setShowAryDetails}
                        onShowAdditionalMetadataChange={setShowAdditionalMetadata}
                        onReportStructureVariantChange={handleReportStructureVariantChange}
                        onDecoupledEntriesChange={setDecoupledEntries}
                        onIncludeSubSectorChange={setIncludeSubSector}
                        includeSubSector={includeSubSector}
                        showMatrix2dOptions={showMatrix2dOptions}
                        contextualWidgets={contextualWidgets}
                        onSetContextualWidgets={setContextualWidgets}
                        textWidgets={textWidgets}
                        onSetTextWidgets={setTextWidgets}
                    />
                </ExpandableContainer>
                <ExpandableContainer
                    className={styles.section}
                    sub
                    headingSize="small"
                    heading={(
                        <div className={styles.heading}>
                            Step 3.
                            <span className={styles.subHeading}>
                                (Optional) Save your query
                            </span>
                        </div>
                    )}
                >
                    <div className={styles.content}>
                        <TextInput
                            name="queryTitle"
                            value={queryTitle}
                            onChange={setQueryTitle}
                            label="Query title"
                            placeholder="Query title"
                            className={styles.queryInput}
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
                <Button
                    name="startExport"
                    variant="primary"
                    className={styles.exportButton}
                    onClick={handleEntryExport}
                    disabled={requestsPending || exportPending}
                >
                    Export
                </Button>
            </div>
            <ExportPreview
                className={styles.preview}
                exportId={previewId}
                onPreviewClick={handleEntryPreview}
            />
        </div>
    );
}

export default EntriesExportSelection;
