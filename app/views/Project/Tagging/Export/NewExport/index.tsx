import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import {
    useHistory,
    useParams,
    generatePath,
    useLocation,
} from 'react-router-dom';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFile,
} from 'react-icons/ai';
import {
    IoBookmarks,
    IoDocument,
    IoCheckmark,
    IoClose,
} from 'react-icons/io5';
import {
    Button,
    Container,
    Heading,
    TextInput,
    ListView,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import { useQuery, useMutation } from '@apollo/client';
import { createSubmitHandler } from '@togglecorp/toggle-form';

import {
    ProjectFrameworkDetailsQuery,
    ProjectFrameworkDetailsQueryVariables,
    CreateExportMutation,
    CreateExportMutationVariables,
    ExportFormatEnum,
    ExportExportTypeEnum,
    ProjectSourceStatsForExportQuery,
    ProjectSourceStatsForExportQueryVariables,
    LeadsFilterDataInputType,
} from '#generated/types';
import StatsInformationCard from '#components/StatsInformationCard';
import routes from '#base/configs/routes';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import _ts from '#ts';

import { ExportItem } from '../ExportHistory';
import AppliedFilters from '../../Sources/AppliedFilters';
import SourcesFilterContext from '../../Sources/SourcesFilterContext';
import { transformRawFiltersToFormValues } from '../../Sources/utils';
import { useFilterState, getProjectSourcesQueryVariables } from '../../Sources/SourcesFilter';
import { FormType as FilterFormType, PartialFormType } from '../../Sources/SourcesFilter/schema';
import AdvancedOptionsSelection from './AdvancedOptionsSelection';
import ExportTypeButton from './ExportTypeButton';
import SourcesSelection from '../SourcesSelection';
import ExportPreviewModal from '../ExportPreviewModal';
import {
    ExportTypeItem,
    TreeSelectableWidget,
    AnalysisFramework,
    Node,
} from '../types';
import {
    filterContexualWidgets,
    createReportStructure,
    createReportLevels,
    getWidgets,
    SECTOR_FIRST,
    createReportStructureForExport,
    createWidgetIds,
    getReportStructureVariant,
    isSubSectorIncluded,
    sortReportStructure,
    selectAndSortWidgets,
} from '../utils';
import { PROJECT_FRAMEWORK_DETAILS, CREATE_EXPORT, PROJECT_SOURCE_STATS_FOR_EXPORT } from '../queries';
import styles from './styles.css';

const mapExportType: Record<ExportFormatEnum, ExportExportTypeEnum> = {
    DOCX: 'REPORT',
    PDF: 'REPORT',
    JSON: 'JSON',
    XLSX: 'EXCEL',
};

const exportTypes: ExportTypeItem[] = [
    {
        key: 'DOCX',
        icon: <AiFillFileWord title="Word export" />,
        title: _ts('export', 'docxLabel'),
    },
    {
        key: 'PDF',
        icon: <AiFillFilePdf title="PDF export" />,
        title: _ts('export', 'pdfLabel'),
    },
    {
        key: 'XLSX',
        icon: <AiFillFileExcel title="Excel export" />,
        title: _ts('export', 'xlsxLabel'),
    },
    {
        key: 'JSON',
        icon: <AiFillFile title="JSON Export" />,
        title: _ts('export', 'jsonLabel'),
    },
];

function exportTypeKeySelector(d: ExportTypeItem) {
    return d.key;
}

type ExportStateData = Pick<ExportItem, 'extraOptions' | 'filters' | 'filtersData' | 'format'>

interface Props {
    className?: string;
}

function NewExport(props: Props) {
    const {
        className,
    } = props;

    const {
        projectId,
    } = useParams<{ projectId: string }>();
    const { state }: { state: ExportStateData | undefined } = useLocation();
    const history = useHistory();
    const [queryTitle, setQueryTitle] = useState<string | undefined>();
    const [
        exportFileFormat,
        setExportFileFormat,
    ] = useState<ExportFormatEnum>(state?.format ?? 'DOCX');
    const [
        selectedLeads,
        setSelectedLeads,
    ] = useState<string[]>(state?.filters?.ids ?? []);
    const [
        selectAll,
        setSelectAll,
    ] = useState<boolean>(state?.filters?.excludeProvidedLeadsId ?? true);
    const [
        reportShowLeadEntryId,
        setReportShowLeadEntryId,
    ] = useState<boolean>(state?.extraOptions?.reportShowLeadEntryId ?? true);
    const [
        reportShowAssessmentData,
        setReportShowAssessmentData,
    ] = useState<boolean>(state?.extraOptions?.reportShowAssessmentData ?? true);
    const [
        reportShowEntryWidgetData,
        setReportShowEntryWidgetData,
    ] = useState<boolean>(state?.extraOptions?.reportShowEntryWidgetData ?? true);
    const [
        textWidgets,
        setTextWidgets,
    ] = useState<TreeSelectableWidget[]>([]);
    const [contextualWidgets, setContextualWidgets] = useState<TreeSelectableWidget[]>([]);
    const [reportStructure, setReportStructure] = useState<Node[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [reportStructureVariant, setReportStructureVariant] = useState<string>(SECTOR_FIRST);
    const [
        excelDecoupled,
        setExcelDecoupled,
    ] = useState<boolean>(state?.extraOptions?.excelDecoupled ?? false);

    const {
        value: sourcesFilterValue,
        setFieldValue: setSourcesFilterFieldValue,
        setValue: setSourcesFilter,
        resetValue: clearSourcesFilterValue,
        pristine,
        validate,
        setError,
        setPristine,
    } = useFilterState();

    useEffect(() => {
        if (state?.filters) {
            setSourcesFilter(transformRawFiltersToFormValues(state?.filters));
        }
    }, [setSourcesFilter, state?.filters]);

    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>(
        state?.filters ? transformRawFiltersToFormValues(state?.filters) : {},
    );

    const finalFilters = useMemo(() => (
        getProjectSourcesQueryVariables(
            sourcesFilters as Omit<FilterFormType, 'projectId'>,
        )
    ), [sourcesFilters]);

    const {
        data: sourcesStats,
    } = useQuery<ProjectSourceStatsForExportQuery, ProjectSourceStatsForExportQueryVariables>(
        PROJECT_SOURCE_STATS_FOR_EXPORT,
        {
            variables: {
                projectId,
                filters: finalFilters as LeadsFilterDataInputType,
            },
        },
    );

    const handleSubmit = useCallback((values: PartialFormType) => {
        setSourcesFilters(values);
        setPristine(true);
    }, [setPristine]);

    const handleApply = useCallback(() => {
        setSelectedLeads([]);
        const submit = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        submit();
    }, [setError, validate, handleSubmit]);

    const handleClear = useCallback(() => {
        setSelectedLeads([]);
        clearSourcesFilterValue();
        setSourcesFilters({});
        setPristine(true);
    }, [clearSourcesFilterValue, setPristine]);

    const [
        createdByOptions,
        setCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        assigneeOptions,
        setAssigneeOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const sourcesFilterContextValue = useMemo(() => ({
        createdByOptions,
        setCreatedByOptions,
        assigneeOptions,
        setAssigneeOptions,
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
        entryCreatedByOptions,
        setEntryCreatedByOptions,
        geoAreaOptions,
        setGeoAreaOptions,
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,
    ]);

    const [
        advancedOptionsModalShown,
        showAdvancedOptionsModal,
        hideAdvancedOptionsModal,
    ] = useModalState(false);

    const [
        previewModalShown,
        showPreviewModal,
        hidePreviewModal,
    ] = useModalState(false);

    const { project } = useContext(ProjectContext);

    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const alert = useAlert();

    const [
        createExport,
        {
            data: createExportData,
            loading: createExportPending,
        },
    ] = useMutation<CreateExportMutation, CreateExportMutationVariables>(
        CREATE_EXPORT,
        {
            onCompleted: (response) => {
                if (response?.project?.exportCreate?.ok) {
                    if (response.project.exportCreate.result?.isPreview) {
                        showPreviewModal();
                    } else {
                        history.replace(generatePath(routes.export.path, { projectId }), 'export-entry-history');
                        alert.show(
                            _ts('export', 'exportStartedNotifyMessage'),
                            { variant: 'success' },
                        );
                    }
                }
            },
            onError: () => {
                alert.show(
                    'Error during export.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const {
        loading: frameworkGetPending,
        data: frameworkResponse,
    } = useQuery<ProjectFrameworkDetailsQuery, ProjectFrameworkDetailsQueryVariables>(
        PROJECT_FRAMEWORK_DETAILS,
        {
            variables: {
                projectId,
            },
            onCompleted: (response) => {
                // TODO handle for conditional widgets
                const widgets = getWidgets(
                    response.project?.analysisFramework as AnalysisFramework,
                );

                const textWidgetsValue = widgets
                    ?.filter((v) => v.widgetId === 'TEXT');
                const textWidgetList = selectAndSortWidgets(
                    textWidgetsValue,
                    state?.extraOptions?.reportTextWidgetIds,
                );
                const contextualWidgetsValue = filterContexualWidgets(widgets);
                const contextualWidgetList = selectAndSortWidgets(
                    contextualWidgetsValue,
                    state?.extraOptions?.reportExportingWidgets,
                );

                setTextWidgets(textWidgetList);
                setContextualWidgets(contextualWidgetList);

                const reportStructureType = getReportStructureVariant(
                    widgets,
                    state?.extraOptions?.reportStructure,
                );
                const subSectorIncluded = isSubSectorIncluded(state?.extraOptions?.reportStructure);
                setReportStructureVariant(reportStructureType);
                setIncludeSubSector(subSectorIncluded);
            },
        },
    );

    const getCreateExportData = useCallback((isPreview: boolean) => ({
        extraOptions: {
            excelDecoupled,
            reportExportingWidgets: createWidgetIds(contextualWidgets),
            reportLevels: createReportLevels(reportStructure).map((node) => ({
                id: node.id,
                levels: node.sublevels,
            })),
            reportShowAssessmentData,
            reportShowEntryWidgetData,
            reportShowGroups: false,
            reportShowLeadEntryId,
            reportStructure: createReportStructureForExport(reportStructure),
            reportTextWidgetIds: createWidgetIds(textWidgets),
        },
        filters: {
            ...getProjectSourcesQueryVariables(sourcesFilters as Omit<FilterFormType, 'projectId'>),
            ids: selectedLeads,
            excludeProvidedLeadsId: selectAll,

        },
        format: exportFileFormat,
        isPreview,
        exportType: mapExportType[exportFileFormat],
        type: 'ENTRIES' as const,
        title: queryTitle,
    }), [
        exportFileFormat,
        contextualWidgets,
        excelDecoupled,
        sourcesFilters,
        queryTitle,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        reportShowLeadEntryId,
        reportStructure,
        selectAll,
        selectedLeads,
        textWidgets,
    ]);

    const analysisFramework = frameworkResponse?.project?.analysisFramework as AnalysisFramework;

    useEffect(() => {
        const structure = createReportStructure(
            reportStructureVariant,
            includeSubSector,
            analysisFramework,
            sourcesFilters?.entriesFilterData?.filterableData,
        );
        if (state?.extraOptions?.reportStructure) {
            const sortedReportStructure = sortReportStructure(
                structure,
                state?.extraOptions?.reportStructure,
            );
            setReportStructure(sortedReportStructure);
        } else {
            setReportStructure(structure);
        }
    }, [
        analysisFramework,
        reportStructureVariant,
        includeSubSector,
        sourcesFilters?.entriesFilterData?.filterableData,
        state?.extraOptions?.reportStructure,
    ]);

    const showMatrix2dOptions = useMemo(
        () => {
            if (frameworkGetPending || !analysisFramework) {
                return false;
            }
            const widgets = getWidgets(analysisFramework);
            return widgets?.some((widget) => widget.widgetId === 'MATRIX2D') ?? false; // TODO check for conditional widgets
        },
        [analysisFramework, frameworkGetPending],
    );
    const exportTypeRendererParams = useCallback((key: ExportFormatEnum, data: ExportTypeItem) => {
        const {
            title,
            icon,
        } = data;

        return ({
            buttonKey: key,
            title,
            icon,
            isActive: exportFileFormat === key,
            onActiveExportFormatChange: setExportFileFormat,
        });
    }, [exportFileFormat, setExportFileFormat]);

    const handleCreateExport = useCallback(() => {
        createExport({
            variables: {
                projectId,
                data: getCreateExportData(false),
            },
        });
    }, [createExport, projectId, getCreateExportData]);

    const handlePreviewClick = useCallback(() => {
        createExport({
            variables: {
                projectId,
                data: getCreateExportData(true),
            },
        });
    }, [createExport, projectId, getCreateExportData]);

    const stats = sourcesStats?.project?.stats;

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(sourcesFilters, ['', null])
    ), [sourcesFilters]);

    return (
        <div className={_cs(styles.newExport, className)}>
            <SubNavbar
                className={styles.header}
                heading="New Export"
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            Close
                        </BackLink>
                        <Button
                            name="showPreview"
                            variant="secondary"
                            disabled={frameworkGetPending}
                            onClick={handlePreviewClick}
                        >
                            Show Preview
                        </Button>
                        <Button
                            disabled={frameworkGetPending || createExportPending}
                            onClick={handleCreateExport}
                            variant="primary"
                            name="startExport"
                        >
                            Start Export
                        </Button>
                    </>
                )}
            />
            <div className={styles.content}>
                <Container
                    className={styles.topBar}
                    contentClassName={styles.topBarContent}
                >
                    <div>
                        <Heading
                            className={styles.title}
                            size="extraSmall"
                        >
                            Export title
                        </Heading>
                        <TextInput
                            className={styles.titleInput}
                            name="queryTitle"
                            value={queryTitle}
                            onChange={setQueryTitle}
                        />
                    </div>
                    <Container
                        heading="File Format"
                        className={styles.fileFormatsContainer}
                        headingSize="extraSmall"
                        contentClassName={styles.fileFormats}
                    >
                        <ListView
                            className={styles.typeOptions}
                            data={exportTypes}
                            keySelector={exportTypeKeySelector}
                            rendererParams={exportTypeRendererParams}
                            renderer={ExportTypeButton}
                            pending={false}
                            errored={false}
                            filtered={false}
                        />
                        {exportFileFormat !== 'JSON' && (
                            <Button
                                className={styles.advancedButton}
                                name="undefined"
                                variant="action"
                                onClick={showAdvancedOptionsModal}
                            >
                                Advanced
                            </Button>
                        )}
                    </Container>
                    {advancedOptionsModalShown && (
                        <AdvancedOptionsSelection
                            onCloseButtonClick={hideAdvancedOptionsModal}
                            exportFileFormat={exportFileFormat}
                            reportStructure={reportStructure}
                            reportStructureVariant={reportStructureVariant}
                            excelDecoupled={excelDecoupled}
                            reportShowLeadEntryId={reportShowLeadEntryId}
                            reportShowAssessmentData={reportShowAssessmentData}
                            reportShowEntryWidgetData={reportShowEntryWidgetData}
                            includeSubSector={includeSubSector}
                            showMatrix2dOptions={showMatrix2dOptions}
                            contextualWidgets={contextualWidgets}
                            textWidgets={textWidgets}
                            onReportStructureChange={setReportStructure}
                            onReportShowLeadEntryIdChange={setReportShowLeadEntryId}
                            onReportShowAssessmentDataChange={setReportShowAssessmentData}
                            onReportShowEntryWidgetDataChange={setReportShowEntryWidgetData}
                            onReportStructureVariantChange={setReportStructureVariant}
                            onExcelDecoupledChange={setExcelDecoupled}
                            onIncludeSubSectorChange={setIncludeSubSector}
                            onContextualWidgetsChange={setContextualWidgets}
                            onTextWidgetsChange={setTextWidgets}
                        />
                    )}
                    {previewModalShown && createExportData?.project?.exportCreate?.result?.id && (
                        <ExportPreviewModal
                            projectId={projectId}
                            exportId={createExportData.project.exportCreate.result.id}
                            onCloseButtonClick={hidePreviewModal}
                        />
                    )}
                </Container>
                <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                    <div className={styles.midBar}>
                        <div className={styles.statsContainer}>
                            <StatsInformationCard
                                icon={(
                                    <IoDocument />
                                )}
                                label={_ts('sourcesStats', 'totalEntries')}
                                totalValue={stats?.numberOfEntries ?? 0}
                                filteredValue={stats?.filteredNumberOfEntries ?? undefined}
                                isFiltered={!isFilterEmpty}
                                variant="accent"
                            />
                            <StatsInformationCard
                                icon={(
                                    <IoBookmarks />
                                )}
                                label="Sources"
                                filteredValue={stats?.filteredNumberOfLeads ?? undefined}
                                totalValue={stats?.numberOfLeads ?? 0}
                                isFiltered={!isFilterEmpty}
                                variant="accent"
                            />
                        </div>
                        <AppliedFilters
                            className={styles.appliedFilters}
                            projectId={projectId}
                            value={sourcesFilterValue}
                            onChange={setSourcesFilterFieldValue}
                        />
                        {!(isFilterEmpty && pristine) && (
                            <div className={styles.buttons}>
                                <Button
                                    disabled={pristine}
                                    name="sourcesFilterSubmit"
                                    icons={(
                                        <IoCheckmark />
                                    )}
                                    variant="tertiary"
                                    onClick={handleApply}
                                >
                                    {_ts('sourcesFilter', 'apply')}
                                </Button>
                                <Button
                                    disabled={isFilterEmpty}
                                    name="clearFilter"
                                    icons={(
                                        <IoClose />
                                    )}
                                    variant="tertiary"
                                    onClick={handleClear}
                                >
                                    {_ts('sourcesFilter', 'clearAll')}
                                </Button>
                            </div>
                        )}
                    </div>
                    <SourcesSelection
                        className={styles.leadsTableContainer}
                        projectId={projectId}
                        filterOnlyUnprotected={filterOnlyUnprotected}
                        selectedLeads={selectedLeads}
                        onSelectLeadChange={setSelectedLeads}
                        selectAll={selectAll}
                        onSelectAllChange={setSelectAll}
                        filterValues={sourcesFilters}
                        sourcesFilterValue={sourcesFilterValue}
                        totalLeadsCount={stats?.numberOfLeads ?? 0}
                        onFilterChange={setSourcesFilterFieldValue}
                    />
                </SourcesFilterContext.Provider>
            </div>
        </div>
    );
}

export default NewExport;
