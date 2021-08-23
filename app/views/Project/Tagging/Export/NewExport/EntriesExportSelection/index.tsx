import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import {
    Button,
    useAlert,
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import _ts from '#ts';
import {
    FrameworkFields,
    Lead,
    ExportType,
    WidgetElement,
    ConditionalWidget,
    EntryOptions,
} from '#types';
import ProjectContext from '#base/context/ProjectContext';

import {
    SourceEntryFilter,
    Node,
    TreeSelectableWidget,
} from '../../types';
import {
    SECTOR_FIRST,
    createReportStructure,
    getContextualWidgetsFromFramework,
    getTextWidgetsFromFramework,
} from '../../utils';
import ExportPreview from '../../ExportPreview';
import LeadsSelection from '../../LeadsSelection';
import ExportTypePane from './ExportTypePane';

import styles from './styles.css';

interface ExportReportStructure {
    id: string;
    levels?: ExportReportStructure[];
}

interface ReportStructureLevel {
    id: string;
    title: string;
    sublevels?: ReportStructureLevel[];
}

const createReportStructureForExport = (nodes: Node[]): ExportReportStructure[] => (
    nodes.filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            levels: node.nodes
                ? createReportStructureForExport(node.nodes)
                : undefined,
        }))
);

const createReportStructureLevelForExport = (nodes: Node[]): ReportStructureLevel[] => (
    nodes
        .filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            title: node.title,
            sublevels: node.nodes
                ? createReportStructureLevelForExport(node.nodes)
                : undefined,
        }))
);

const createWidgetIds = (widgets: TreeSelectableWidget<string | number>[]) => (
    widgets
        .filter((widget) => widget.selected)
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
    className?: string;
    projectId: number;
}

function EntriesExportSelection(props: Props) {
    const {
        className,
        projectId,
    } = props;
    const alert = useAlert();

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('CREATE_UNPROTECTED');

    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string | number>[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [showEntryId, setShowEntryId] = useState<boolean>(true);
    const [showAryDetails, setShowAryDetails] = useState<boolean>(true);
    const [showAdditionalMetadata, setShowAdditionalMetadata] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<Node[]>([]);
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
        onSuccess: (response) => {
            const textWidgetList = getTextWidgetsFromFramework(response);
            const contextualWidgetList = getContextualWidgetsFromFramework(response);
            setTextWidgets(textWidgetList);
            setContextualWidgets(contextualWidgetList);
        },
        failureHeader: _ts('export', 'afLabel'),
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
        body: (ctx) => ({ filters: ctx }),
        onSuccess: (response) => {
            if (isPreview) {
                setPreviewId(response.exportTriggered);
            } else {
                alert.show(
                    _ts('export', 'exportStartedNotifyMessage'),
                    { variant: 'success' },
                );
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
            .map((node) => ({
                id: node.id,
                levels: node.sublevels,
            }));
        const newReportStructure = createReportStructureForExport(reportStructure);
        const textWidgetIds = createWidgetIds(textWidgets);
        let contextualWidgetIds;
        if (isWord || isPdf) {
            contextualWidgetIds = createWidgetIds(contextualWidgets);
        }

        const filters = {
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
            ...filterValues,
        };

        setIsPreview(preview);
        getExport(filters);
    }, [
        selectAll,
        activeExportTypeKey,
        contextualWidgets,
        decoupledEntries,
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
    ]);

    const handleEntryExport = useCallback(() => {
        startExport(false);
    }, [startExport]);

    const handleEntryPreview = useCallback(() => {
        setPreviewId(undefined);
        startExport(true);
    }, [setPreviewId, startExport]);

    const requestsPending = analysisFrameworkPending || entryOptionsPending;
    const showMatrix2dOptions = useMemo(
        () => {
            if (requestsPending || !analysisFramework || isNotDefined(analysisFramework.widgets)) {
                return false;
            }
            return analysisFramework.widgets.some((widget: WidgetElement<unknown>) => {
                if (widget.widgetId === 'matrix2dWidget') {
                    return true;
                }
                if (widget.widgetId === 'conditionalWidget') {
                    const { properties: { data } } = widget as WidgetElement<ConditionalWidget>;
                    const widgetsList = (data?.widgets ?? [])
                        .map((w) => w?.widget);
                    return widgetsList.some((w) => w?.widgetId === 'matrix2dWidget');
                }
                return false;
            });
        },
        [analysisFramework, requestsPending],
    );
    const handleSaveAndExport = () => {
        console.warn('Clicked on save and export');
    }; // TODO add this feature later

    return (
        <div className={_cs(className, styles.export)}>
            <div className={styles.left}>
                <div className={styles.leftControls}>
                    <ExpandableContainer
                        className={styles.section}
                        headingSize="small"
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
                            className={styles.leadsTableContainer}
                            projectId={projectId}
                            filterOnlyUnprotected={filterOnlyUnprotected}
                            entriesFilters={analysisFramework?.filters}
                            entriesWidgets={analysisFramework?.widgets}
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
                </div>
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
