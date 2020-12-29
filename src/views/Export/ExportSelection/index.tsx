import React, { useState, useEffect, useMemo, useCallback } from 'react';
import produce from 'immer';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { listToMap } from '@togglecorp/fujs';

import Page from '#rscv/Page';
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
import ExportHeader from '../ExportHeader';
import LeadsTable from '../LeadsTable';
import ExportTypePane from '../ExportTypePane';

import styles from './styles.scss';

interface PropsFromDispatch {
    setAnalysisFramework: typeof setAnalysisFrameworkAction;
    setGeoOptions: typeof setGeoOptionsAction;
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
    const [previewId, setPreviewId] = useState<number | undefined>(undefined);
    const [activeExportTypeKey, setActiveExportTypeKey] = useState<ExportType>('word');
    const [decoupledEntries, setDecoupledEntries] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string | number>[]>([]);
    const [showGroups, setShowGroups] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<ReportStructure[]>([]);
    const [leads, setLeads] = useState<SelectedLead[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
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
                    onPreview={setPreviewId}
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
                    />
                </React.Fragment>
            }
        />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Export);
