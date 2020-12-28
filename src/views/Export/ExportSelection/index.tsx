import React, { useState, useEffect, useMemo, useCallback } from 'react';
import produce from 'immer';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { listToMap } from '@togglecorp/fujs';

import { processEntryFilters } from '#entities/entries';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import FilterLeadsForm from '#components/other/FilterLeadsForm';
import ExportPreview from '#components/other/ExportPreview';

import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
    activeProjectRoleSelector,
    entryFilterOptionsForProjectSelector,
} from '#redux';

import {
    SECTOR_FIRST,
    createReportStructure,
    getContextualWidgetsFromFramework,
    getTextWidgetsFromFramework,
} from '#utils/framework';

import { getFiltersForRequest } from '#entities/lead';
import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import {
    AppState,
    FrameworkFields,
    Lead,
    MultiResponse,
    ExportType,
    TreeSelectableWidget,
    ReportStructure,
} from '#typings';

import FilterEntriesForm from '../../Entries/FilterEntriesForm';
import LeadsTable from '../LeadsTable';
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
    leadsFilters: leadPageFilterSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
    projectRole: activeProjectRoleSelector(state),
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
    leadsFilters: unknown;
    geoOptions: unknown;
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
        leadsFilters,
        entryFilterOptions,
        projectRole,
        setAnalysisFramework,
        setGeoOptions,
    } = props;

    const {
        filters,
        widgets,
    } = analysisFramework;

    const filterOnlyUnprotected = projectRole?.exportPermissions?.['create_only_unprotected'];
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string | number>[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<ReportStructure[]>([]);
    const [leads, setLeads] = useState<SelectedLead[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [filtersToExport, setFiltersToExport] = useState<unknown>();

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
        onFailure: (error, errorBody) => {
            notifyOnFailure(_ts('export', 'afLabel'))({ error: errorBody });
        },
    });

    const sanitizedFilters = useMemo(() => {
        const processedFilters = getFiltersForRequest(leadsFilters);
        // Unprotected filter is sent to request to fetch leads
        // if user cannot create export for confidential documents
        if (filterOnlyUnprotected) {
            processedFilters.confidentiality = ['unprotected'];
        }
        return processedFilters;
    }, [filterOnlyUnprotected, leadsFilters]);

    const leadsRequestBody = useMemo(() => ({
        project: [projectId],
        ...sanitizedFilters,
    }), [projectId, sanitizedFilters]);

    const [
        leadsPending,
    ] = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        method: 'POST',
        query: {
            fields: ['id', 'title', 'created_at'],
        },
        autoTrigger: true,
        body: leadsRequestBody,
        onSuccess: (response) => {
            const newLeads: SelectedLead[] = [];
            (response.results || []).forEach((l) => {
                newLeads.push({
                    selected: true,
                    ...l,
                });
            });
            setLeads(newLeads);
        },
        onFailure: (error, errorBody) => {
            notifyOnFailure(_ts('export', 'leadsLabel'))({ error: errorBody });
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
        onFailure: (error, errorBody) => {
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

    const handleSelectLeadChange = useCallback((key: number, value: boolean) => (
        setLeads((oldLeads) => {
            const newLeads = produce(oldLeads, (safeLeads) => {
                const index = safeLeads.findIndex(d => d.id === key);
                if (index !== -1) {
                    // eslint-disable-next-line no-param-reassign
                    safeLeads[index].selected = value;
                }
            });
            return newLeads;
        })
    ), []);

    const handleSelectAllLeads = useCallback((selectAll: boolean) => (
        setLeads((oldLeads) => {
            const newLeads = oldLeads.map(l => ({
                ...l,
                selected: selectAll,
            }));
            return newLeads;
        })
    ), []);

    const handleReportStructureVariantChange = useCallback((value: string) => {
        setReportStructureVariant(value);
    }, []);

    const selectedLeads = useMemo(() =>
        listToMap(leads, d => d.id, d => d.selected),
    [leads]);

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

    const pending = leadsPending || analysisFrameworkPending || geoOptionsPending;

    return (
        <div className={styles.export}>
            <section className={styles.filters} >
                <div className={styles.leadFilters}>
                    <div className={styles.leadAttributes}>
                        <h4 className={styles.heading}>
                            {_ts('export', 'leadAttributesLabel')}
                        </h4>
                        <FilterLeadsForm
                            className={styles.leadsFilterForm}
                            filterOnlyUnprotected={filterOnlyUnprotected}
                        />
                    </div>
                    <LeadsTable
                        className={styles.leadsTable}
                        pending={leadsPending}
                        leads={leads}
                        onSelectLeadChange={handleSelectLeadChange}
                        onSelectAllClick={handleSelectAllLeads}
                    />
                </div>
                <div className={styles.entryFilters}>
                    <h4 className={styles.heading}>
                        {_ts('export', 'entryAttributesLabel')}
                    </h4>
                    <FilterEntriesForm
                        className={styles.entriesFilter}
                        applyOnChange
                        pending={analysisFrameworkPending || geoOptionsPending}
                        filters={filters}
                        widgets={widgets}
                        geoOptions={geoOptions}
                    />
                </div>
                <PrimaryButton
                    className={styles.exportButton}
                    onClick={handleEntryExport}
                    disabled={pending}
                    pending={exportPending}
                >
                    {_ts('export', 'startExportButtonLabel')}
                </PrimaryButton>
            </section>
            <ExportTypePane
                activeExportTypeKey={activeExportTypeKey}
                reportStructure={reportStructure}
                textWidgets={textWidgets}
                contextualWidgets={contextualWidgets}
                reportStructureVariant={reportStructureVariant}
                decoupledEntries={decoupledEntries}
                showGroups={showGroups}
                onExportTypeChange={setActiveExportTypeKey}
                onReportStructureChange={setReportStructure}
                onContextualWidgetsChange={setContextualWidgets}
                onTextWidgetsChange={setTextWidgets}
                entryFilterOptions={entryFilterOptions}
                onShowGroupsChange={setShowGroups}
                onReportStructureVariantChange={handleReportStructureVariantChange}
                onDecoupledEntriesChange={setDecoupledEntries}
                onIncludeSubSectorChange={setIncludeSubSector}
                includeSubSector={includeSubSector}
            />
            <ExportPreview
                className={styles.preview}
                exportId={previewId}
                onPreviewClick={handleEntryPreview}
            />
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(EntriesExportSelection);
