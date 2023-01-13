import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import {
    useHistory,
    useParams,
    generatePath,
    useLocation,
} from 'react-router-dom';
import {
    _cs,
    doesObjectHaveNoData,
    isDefined,
} from '@togglecorp/fujs';
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
import {
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';
import { useQuery, useMutation, gql } from '@apollo/client';

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
    ExportExcelSelectedStaticColumnEnum,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import {
    mergeLists,
} from '#utils/common';
import {
    FrameworkFilterType,
} from '#types/newAnalyticalFramework';
import StatsInformationCard from '#components/StatsInformationCard';
import routes from '#base/configs/routes';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import { useFilterState, getProjectSourcesQueryVariables } from '#components/leadFilters/SourcesFilter';
import { FormType as FilterFormType, PartialFormType } from '#components/leadFilters/SourcesFilter/schema';
import { transformRawFiltersToFormValues } from '#components/leadFilters/SourcesFilter/utils';
import SourcesAppliedFilters from '#components/leadFilters/SourcesAppliedFilters';
import SourcesSelection from '#components/general/SourcesSelection';
import { ExportItem } from '#components/general/ExportHistory';
import ExportPreviewModal from '#components/general/ExportPreviewModal';
import { FRAMEWORK_FRAGMENT } from '#gqlFragments';
import _ts from '#ts';

import AdvancedOptionsSelection from './AdvancedOptionsSelection';
import ExportTypeButton from './ExportTypeButton';
import {
    ExportTypeItem,
    TreeSelectableWidget,
    AnalysisFramework,
    Node,
} from './types';
import {
    filterContextualWidgets,
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
} from './utils';
import styles from './styles.css';

const PROJECT_FRAMEWORK_DETAILS = gql`
    ${FRAMEWORK_FRAGMENT}
    query ProjectFrameworkDetails($projectId: ID!) {
        project(id: $projectId) {
            id
            analysisFramework {
                exportables {
                    data
                    id
                    inline
                    order
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                }
                filters {
                    id
                    key
                    properties
                    title
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                    filterType
                    filterTypeDisplay
                }
                # NOTE: Does not need predictionTagsMapping from FrameworkResponse
                ...FrameworkResponse
            }
        }
        sourceStatusOptions: __type(name: "LeadStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourcePriorityOptions: __type(name: "LeadPriorityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        organizationTypes {
            results {
                id
                title
            }
        }
        entryTypeOptions: __type(name: "EntryTagTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        staticColumnOptions: __type(name: "ExportExcelSelectedStaticColumnEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

const CREATE_EXPORT = gql`
    mutation CreateExport(
        $projectId: ID!,
        $data: ExportCreateInputType!,
    ) {
        project(id: $projectId) {
            id
            exportCreate(data: $data) {
                ok
                errors
                result {
                    id
                    title
                    isPreview
                }
            }
        }
    }
`;

const PROJECT_SOURCE_STATS_FOR_EXPORT = gql`
    query ProjectSourceStatsForExport(
        $projectId: ID!,
        $filters: LeadsFilterDataInputType,
    ) {
        project(id: $projectId) {
            id
            stats(filters: $filters) {
                numberOfEntries
                numberOfLeads
                filteredNumberOfEntries
                filteredNumberOfLeads
            }
        }
    }
`;
// FIXME: use from utils
interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

export interface ExcelColumnNode {
    selected: boolean;
    key: string;
    title: string;
    isWidget: boolean;
    widgetKey?: string;
}

const hasEntryOptions: BooleanOption[] = [
    { key: 'true', value: 'Has entry' },
    { key: 'false', value: 'No entries' },
];

const hasAssessmentOptions: BooleanOption[] = [
    { key: 'true', value: 'Assessment completed' },
    { key: 'false', value: 'Assessment not completed' },
];

const mapExportType: Record<ExportFormatEnum, ExportExportTypeEnum> = {
    DOCX: 'REPORT',
    PDF: 'REPORT',
    // FIXME: Not sure what I am doing here
    CSV: 'EXCEL',
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

type ExportStateData = Pick<ExportItem, 'extraOptions' | 'filters' | 'filtersData' | 'format'>;

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

    const { state: locationState } = useLocation<ExportStateData | undefined>();

    const history = useHistory();
    const [queryTitle, setQueryTitle] = useState<string | undefined>();
    const [titleError, setTitleError] = useState<string | undefined>();

    const handleQueryTitleChange = useCallback((newTitle: string | undefined) => {
        setQueryTitle(newTitle);
        setTitleError(undefined);
    }, []);

    const alert = useAlert();

    const { project } = useContext(ProjectContext);

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

    const [
        exportFileFormat,
        setExportFileFormat,
    ] = useState<ExportFormatEnum>(locationState?.format ?? 'DOCX');
    const [
        selectedLeads,
        setSelectedLeads,
    ] = useState<string[]>(locationState?.filters?.ids ?? []);
    const [
        selectAll,
        setSelectAll,
    ] = useState<boolean>(locationState?.filters?.excludeProvidedLeadsId ?? true);
    const [
        reportShowLeadEntryId,
        setReportShowLeadEntryId,
    ] = useState<boolean>(locationState?.extraOptions?.reportShowLeadEntryId ?? true);
    const [
        reportShowAssessmentData,
        setReportShowAssessmentData,
    ] = useState<boolean>(locationState?.extraOptions?.reportShowAssessmentData ?? true);
    const [
        reportShowEntryWidgetData,
        setReportShowEntryWidgetData,
    ] = useState<boolean>(locationState?.extraOptions?.reportShowEntryWidgetData ?? true);
    const [
        excelDecoupled,
        setExcelDecoupled,
    ] = useState<boolean>(locationState?.extraOptions?.excelDecoupled ?? false);

    const [
        textWidgets,
        setTextWidgets,
    ] = useState<TreeSelectableWidget[]>([]);
    const [columns, setColumns] = useState<ExcelColumnNode[]>([]);
    const [
        contextualWidgets,
        setContextualWidgets,
    ] = useState<TreeSelectableWidget[]>([]);
    const [
        reportStructure,
        setReportStructure,
    ] = useState<Node[]>([]);
    const [
        includeSubSector,
        setIncludeSubSector,
    ] = useState<boolean>(false);
    const [
        reportStructureVariant,
        setReportStructureVariant,
    ] = useState<string>(SECTOR_FIRST);

    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    const [
        createdByOptions,
        setCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>(
        locationState?.filtersData?.createdByOptions ?? [],
    );

    const [
        assigneeOptions,
        setAssigneeOptions,
    ] = useState<ProjectMember[] | undefined | null>(
        locationState?.filtersData?.assigneeOptions ?? [],
    );

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>(
        locationState?.filtersData?.authorOrganizationOptions ?? [],
    );

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>(
        locationState?.filtersData?.sourceOrganizationOptions ?? [],
    );
    const [
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>(
        locationState?.filtersData?.entryFilterCreatedByOptions ?? [],
    );
    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(
        locationState?.filtersData?.entryFilterGeoAreaOptions ?? [],
    );

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
                const analyticalFramework = response.project?.analysisFramework as (
                    AnalysisFramework | null | undefined
                );
                // NOTE: Let's also check for errors
                if (!analyticalFramework) {
                    return;
                }
                // TODO: handle for conditional widgets
                const widgets = getWidgets(analyticalFramework);

                const textWidgetsValue = widgets
                    ?.filter((v) => v.widgetId === 'TEXT');
                const textWidgetList = selectAndSortWidgets(
                    textWidgetsValue,
                    locationState?.extraOptions?.reportTextWidgetIds,
                );
                setTextWidgets(textWidgetList);

                const contextualWidgetsValue = filterContextualWidgets(widgets);
                const contextualWidgetList = selectAndSortWidgets(
                    contextualWidgetsValue,
                    locationState?.extraOptions?.reportExportingWidgets,
                );
                setContextualWidgets(contextualWidgetList);

                const reportStructureType = getReportStructureVariant(
                    widgets,
                    locationState?.extraOptions?.reportStructure,
                );
                setReportStructureVariant(reportStructureType);

                const subSectorIncluded = isSubSectorIncluded(
                    locationState?.extraOptions?.reportStructure,
                );
                setIncludeSubSector(subSectorIncluded);

                const filters = transformRawFiltersToFormValues(
                    locationState?.filters,
                    analyticalFramework?.filters,
                );

                const mappedWidgetList = widgets?.map((w) => ({
                    isWidget: true,
                    selected: true,
                    key: w.key,
                    title: w.title ?? '',
                }));

                const mappedValues = response.staticColumnOptions?.enumValues?.map((val) => ({
                    isWidget: false,
                    title: val.description ?? '',
                    key: val.name,
                    selected: true,
                }));

                const combinedList = [
                    ...mappedValues ?? [],
                    ...mappedWidgetList ?? [],
                ];

                const initialColumns = locationState?.extraOptions?.excelColumns?.map(
                    (item) => {
                        const key = item.isWidget ? item.widgetKey : item.staticColumn;
                        return key ? {
                            isWidget: item.isWidget,
                            selected: true,
                            title: '',
                            key,
                        } : undefined;
                    },
                ).filter(isDefined);

                const mergedColumnList = mergeLists(
                    initialColumns ?? [],
                    combinedList.map((item) => ({ ...item, selected: false })),
                    (item) => item.key,
                    (_, newItem) => ({
                        ...newItem,
                        selected: true,
                    }),
                );

                setColumns((initialColumns?.length ?? 0) > 0 ? mergedColumnList : combinedList);

                // FIXME: let's try to remove these
                setSourcesFilter(filters);
                setSourcesFilters(filters);
            },
        },
    );

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
                if (response?.project?.exportCreate?.errors) {
                    const formError = transformToFormError(
                        removeNull(response.project.exportCreate?.errors) as ObjectError[],
                    );
                    // FIXME: Use form in export to fix this later
                    // NOTE: Title error is always string
                    setTitleError(formError?.title as string);
                    alert.show(
                        'Error during export.',
                        {
                            variant: 'error',
                        },
                    );
                }
                if (!response?.project?.exportCreate?.ok) {
                    alert.show(
                        'Error during export.',
                        {
                            variant: 'error',
                        },
                    );
                    return;
                }
                if (response.project.exportCreate.result?.isPreview) {
                    showPreviewModal();
                    return;
                }
                history.replace(generatePath(routes.export.path, { projectId }), 'export-entry-history');
                alert.show(
                    _ts('export', 'exportStartedNotifyMessage'),
                    { variant: 'success' },
                );
            },
            onError: () => {
                alert.show(
                    'Error during export.',
                    { variant: 'error' },
                );
            },
        },
    );

    const analysisFramework = frameworkResponse?.project?.analysisFramework as AnalysisFramework;
    // FIXME: when should this code run?
    useEffect(() => {
        const structure = createReportStructure(
            reportStructureVariant,
            includeSubSector,
            analysisFramework,
            sourcesFilters?.entriesFilterData?.filterableData,
        );
        if (locationState?.extraOptions?.reportStructure) {
            const sortedReportStructure = sortReportStructure(
                structure,
                locationState?.extraOptions?.reportStructure,
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
        locationState?.extraOptions?.reportStructure,
    ]);

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

    const getCreateExportData = useCallback((isPreview: boolean) => ({
        extraOptions: {
            excelDecoupled,
            excelColumns: columns.filter((widget) => widget.selected).map((col) => (
                col.isWidget ? {
                    isWidget: col.isWidget,
                    widgetKey: col.key,
                } : {
                    isWidget: col.isWidget,
                    staticColumn: col.key as ExportExcelSelectedStaticColumnEnum,
                }
            )),
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
        columns,
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

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(sourcesFilters, ['', null])
    ), [sourcesFilters]);

    const stats = sourcesStats?.project?.stats;

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

    const statusOptions = frameworkResponse
        ?.sourceStatusOptions?.enumValues;
    const priorityOptions = frameworkResponse
        ?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = frameworkResponse
        ?.sourceConfidentialityOptions?.enumValues;
    // FIXME: this may be problematic in the future
    const organizationTypeOptions = frameworkResponse
        ?.organizationTypes?.results;
    const entryTypeOptions = frameworkResponse
        ?.entryTypeOptions?.enumValues;
    const frameworkFilters = (frameworkResponse
        ?.project?.analysisFramework?.filters) as (FrameworkFilterType[] | null | undefined);

    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

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

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasAssessmentOptions,
        hasEntryOptions,
        entryTypeOptions,
        frameworkFilters,
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        entryTypeOptions,
        frameworkFilters,
    ]);

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
                            onChange={handleQueryTitleChange}
                            error={titleError}
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
                            widgetColumns={columns}
                            onWidgetColumnChange={setColumns}
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
                        <SourcesAppliedFilters
                            className={styles.appliedFilters}
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
