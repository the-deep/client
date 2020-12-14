import React, { useState, useEffect, useMemo, useCallback } from 'react';
import produce from 'immer';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { listToMap } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import ExportPreview from '#components/other/ExportPreview';
import FilterLeadsForm from '#components/other/FilterLeadsForm';

import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
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
import notify from '#notify';
import _ts from '#ts';

import {
    AppState,
    FrameworkFields,
    Lead,
    MultiResponse,
    ExportType,
    ReportStructureVariant,
    TreeSelectableWidget,
    ReportStructure,
} from '#typings';

import FilterEntriesForm from '../Entries/FilterEntriesForm';
import ExportHeader from './ExportHeader';
import LeadsTable from './LeadsTable';
import ExportTypePane from './ExportTypePane';

import styles from './styles.scss';

interface PropsFromDispatch {
    setAnalysisFramework: typeof setAnalysisFrameworkAction;
    setGeoOptions: typeof setGeoOptionsAction;
}

const mapStateToProps = (state: AppState) => ({
    projectId: projectIdFromRouteSelector(state),
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

interface ComponentProps {
    projectRole: {
        exportPermissions?: {
            'create_only_unprotected'?: boolean;
        };
    };
    setAnalysisFramework: () => void;
    analysisFramework: FrameworkFields;
    projectId: number;
    entriesFilters: {};
    entryFilterOptions: {};
    leadsFilters: {};
    setGeoOptions: () => void;
    geoOptions: {};
}

type Props = ComponentProps & PropsFromDispatch;

function Export(props: Props) {
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
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget[]>([]);
    const [contextualWidgets, setContextualWidgets] = useState<TreeSelectableWidget[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<ReportStructure[]>([]);
    const [leads, setLeads] = useState<SelectedLead[]>([]);
    const [
        reportStructureVariant,
        setReportStructureVariant,
    ] = useState<ReportStructureVariant>(SECTOR_FIRST);

    const [
        analysisFrameworkPending,
        ,
        ,
        getAnalysisFramework,
    ] = useRequest<unknown>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        schemaName: 'analysisFramework',
        onSuccess: (response) => {
            setAnalysisFramework({ analysisFramework: response });
        },
        onFailure: (error) => {
            notify.send({
                title: _ts('export', 'afLabel'),
                type: notify.type.ERROR,
                message: error,
                duration: notify.duration.MEDIUM,
            });
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

    const [
        leadsPending,
        ,
        ,
        getLeads,
    ] = useRequest<MultiResponse<Lead>>({
        url: 'server://v2/leads/filter/',
        method: 'POST',
        query: {
            fields: ['id', 'title', 'created_at'],
        },
        body: {
            project: [projectId],
            ...sanitizedFilters,
        },
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
        onFailure: (error) => {
            notify.send({
                title: _ts('export', 'leadsLabel'),
                type: notify.type.ERROR,
                message: error,
                duration: notify.duration.MEDIUM,
            });
        },
    });

    const [
        geoOptionsPending,
        ,
        ,
        getGeoOptions,
    ] = useRequest<unknown>({
        url: 'server://geo-options/',
        method: 'GET',
        query: {
            project: projectId,
        },
        schemaName: 'geoOptions',
        onSuccess: (response) => {
            setGeoOptions({ projectId, locations: response });
        },
        onFailure: (error) => {
            notify.send({
                title: _ts('export', 'geoLabel'),
                type: notify.type.ERROR,
                message: error,
                duration: notify.duration.MEDIUM,
            });
        },
    });

    useEffect(() => {
        getAnalysisFramework();
        getGeoOptions();
    },
    [getAnalysisFramework, getGeoOptions, projectId]);

    useEffect(
        getLeads,
        [projectId, leadsFilters],
    );

    useEffect(() => {
        setActiveExportTypeKey('word');
        setPreviewId(undefined);
        setReportStructure([]);
        setDecoupledEntries(true);
    }, [projectId]);

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
        );
        setReportStructure(structure);
    }, [analysisFramework, reportStructureVariant]);

    const handleShowGroupsChange = setShowGroups;

    const handleSelectLeadChange = useCallback((key: number, value: boolean) => {
        const newLeads = produce(leads, (safeLeads) => {
            const index = safeLeads.findIndex(d => d.id === key);
            if (index !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeLeads[index].selected = value;
            }
        });
        setLeads(newLeads);
    }, [leads]);

    const handleSelectAllLeads = useCallback((selectAll: boolean) => {
        const newLeads = leads.map(l => ({
            ...l,
            selected: selectAll,
        }));

        setLeads(newLeads);
    }, [leads]);

    const handleReportStructureChange = setReportStructure;

    const handleTextWidgetsSelection = setTextWidgets;

    const handleContextualWidgetsSelection = setContextualWidgets;

    const handleDecoupledEntriesChange = setDecoupledEntries;

    const handleExportTypeSelectButtonClick = setActiveExportTypeKey;

    const handlePreview = setPreviewId;

    const handleReportStructureVariantChange = useCallback((value: ReportStructureVariant) => {
        const report = createReportStructure(analysisFramework, value);
        setReportStructureVariant(value);
        setReportStructure(report);
    }, [analysisFramework]);

    const selectedLeads = useMemo(() =>
        listToMap(leads, d => d.id, d => d.selected),
    [leads]);

    return (
        <Page
            className={styles.export}
            header={
                <ExportHeader
                    projectId={projectId}
                    entriesFilters={entriesFilters}
                    activeExportTypeKey={activeExportTypeKey}
                    selectedLeads={selectedLeads}
                    reportStructure={reportStructure}
                    decoupledEntries={decoupledEntries}
                    onPreview={handlePreview}
                    showGroups={showGroups}
                    pending={leadsPending || analysisFrameworkPending || geoOptionsPending}
                    analysisFramework={analysisFramework}
                    geoOptions={geoOptions}
                    textWidgets={textWidgets}
                    contextualWidgets={contextualWidgets}
                />
            }
            mainContentClassName={styles.mainContent}
            mainContent={
                <React.Fragment>
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
                    </section>
                    <ExportTypePane
                        activeExportTypeKey={activeExportTypeKey}
                        reportStructure={reportStructure}
                        textWidgets={textWidgets}
                        contextualWidgets={contextualWidgets}
                        reportStructureVariant={reportStructureVariant}
                        decoupledEntries={decoupledEntries}
                        onExportTypeChange={handleExportTypeSelectButtonClick}
                        onReportStructureChange={handleReportStructureChange}
                        onContextualWidgetsChange={handleContextualWidgetsSelection}
                        onTextWidgetsChange={handleTextWidgetsSelection}
                        entryFilterOptions={entryFilterOptions}
                        showGroups={showGroups}
                        onShowGroupsChange={handleShowGroupsChange}
                        onReportStructureVariantChange={handleReportStructureVariantChange}
                        onDecoupledEntriesChange={handleDecoupledEntriesChange}
                        analysisFramework={analysisFramework}
                    />
                    <ExportPreview
                        className={styles.preview}
                        exportId={previewId}
                    />
                </React.Fragment>
            }
        />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Export);
