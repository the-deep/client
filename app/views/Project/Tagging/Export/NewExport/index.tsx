import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    useParams,
} from 'react-router-dom';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFileText,
} from 'react-icons/ai';
import {
    Button,
    TextInput,
    List,
    Modal,
    useModalState,
    useAlert,
} from '@the-deep/deep-ui';
import { useQuery, useMutation } from '@apollo/client';
import {
    ProjectFrameworkDetailsQuery,
    ProjectFrameworkDetailsQueryVariables,
    CreateExportMutation,
    CreateExportMutationVariables,
    ExportFormatEnum,
    ExportExportTypeEnum,
} from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import _ts from '#ts';

import { useFilterState, getProjectSourcesQueryVariables } from '../../Sources/SourcesFilter';
import { FormType as FilterFormType } from '../../Sources/SourcesFilter/schema';
import AdvancedOptionsSelection from './AdvancedOptionsSelection';
import ExportTypeButton from './ExportTypeButton';
import LeadsSelection from '../LeadsSelection';
import ExportPreviewModal from './ExportPreviewModal';
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
} from '../utils';

import { PROJECT_FRAMEWORK_DETAILS, CREATE_EXPORT } from './queries';
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
        icon: <AiFillFileText title="JSON Export" />,
        title: _ts('export', 'jsonLabel'),
    },
];

function exportTypeKeySelector(d: ExportTypeItem) {
    return d.key;
}

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

    const [queryTitle, setQueryTitle] = useState<string | undefined>();
    const [exportFileFormat, setExportFileFormat] = useState<ExportFormatEnum>('DOCX');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);

    // advanced-options
    const [reportShowGroups, setReportShowGroups] = useState<boolean>(true);
    const [reportShowLeadEntryId, setReportShowLeadEntryId] = useState<boolean>(true);
    const [reportShowAssessmentData, setReportShowAssessmentData] = useState<boolean>(true);
    const [reportShowEntryWidgetData, setReportShowEntryWidgetData] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget[]>([]);
    const [contextualWidgets, setContextualWidgets] = useState<TreeSelectableWidget[]>([]);
    const [reportStructure, setReportStructure] = useState<Node[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [reportStructureVariant, setReportStructureVariant] = useState<string>(SECTOR_FIRST);
    const [excelDecoupled, setExcelDecoupled] = useState<boolean>(true);

    const {
        value: sourcesFilters,
        setFieldValue: setSourcesFilterValue,
    } = useFilterState();

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

    const { project } = React.useContext(ProjectContext);

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
                const textWidgetList = widgets
                    ?.filter((v) => v.widgetId === 'TEXT')
                    .map((v) => ({ ...v, selected: true }));

                const contextualWidgetList = filterContexualWidgets(widgets)
                    ?.map((v) => ({ ...v, selected: true }));

                setTextWidgets(textWidgetList ?? []);
                setContextualWidgets(contextualWidgetList ?? []);
            },
        },
    );

    const getCreateExportData = useCallback((isPreview: boolean) => ({
        excelDecoupled,
        filters: {
            ...getProjectSourcesQueryVariables(sourcesFilters as Omit<FilterFormType, 'projectId'>),
            ids: selectedLeads,
            excludeProvidedLeadsId: selectAll,
        },
        format: exportFileFormat,
        isPreview,
        exportType: mapExportType[exportFileFormat],
        reportLevels: createReportLevels(reportStructure).map((node) => ({
            id: node.id,
            levels: node.sublevels,
        })),
        reportStructure: createReportStructureForExport(reportStructure),
        reportTextWidgetIds: createWidgetIds(textWidgets),
        reportExportingWidgets: createWidgetIds(contextualWidgets),
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        reportShowGroups,
        reportShowLeadEntryId,
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
        reportShowGroups,
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
        );
        setReportStructure(structure);
    }, [
        analysisFramework,
        reportStructureVariant,
        includeSubSector,
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

    const handlePreviewClose = useCallback(() => {
        hidePreviewModal();
    }, [hidePreviewModal]);

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
                            variant="primary"
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
                <div>
                    <TextInput
                        name="queryTitle"
                        value={queryTitle}
                        onChange={setQueryTitle}
                        label="Export Title"
                        placeholder="Export Title"
                    />
                    <List
                        data={exportTypes}
                        rendererParams={exportTypeRendererParams}
                        renderer={ExportTypeButton}
                        keySelector={exportTypeKeySelector}
                    />
                    {exportFileFormat !== 'JSON' && (
                        <Button
                            name="undefined"
                            variant="action"
                            onClick={showAdvancedOptionsModal}
                        >
                            Advanced
                        </Button>
                    )}
                    {advancedOptionsModalShown && (
                        <Modal
                            size="cover"
                            heading="Advanced Options"
                            onCloseButtonClick={hideAdvancedOptionsModal}
                        >
                            <AdvancedOptionsSelection
                                exportFileFormat={exportFileFormat}
                                reportStructure={reportStructure}
                                reportStructureVariant={reportStructureVariant}
                                excelDecoupled={excelDecoupled}
                                reportShowGroups={reportShowGroups}
                                reportShowLeadEntryId={reportShowLeadEntryId}
                                reportShowAssessmentData={reportShowAssessmentData}
                                reportShowEntryWidgetData={reportShowEntryWidgetData}
                                includeSubSector={includeSubSector}
                                showMatrix2dOptions={showMatrix2dOptions}
                                contextualWidgets={contextualWidgets}
                                textWidgets={textWidgets}
                                onReportStructureChange={setReportStructure}
                                onReportShowGroupsChange={setReportShowGroups}
                                onReportShowLeadEntryIdChange={setReportShowLeadEntryId}
                                onReportShowAssessmentDataChange={setReportShowAssessmentData}
                                onReportShowEntryWidgetDataChange={setReportShowEntryWidgetData}
                                onReportStructureVariantChange={setReportStructureVariant}
                                onExcelDecoupledChange={setExcelDecoupled}
                                onIncludeSubSectorChange={setIncludeSubSector}
                                onContextualWidgetsChange={setContextualWidgets}
                                onTextWidgetsChange={setTextWidgets}
                            />
                        </Modal>
                    )}
                    {previewModalShown && createExportData?.project?.exportCreate?.result?.id && (
                        <ExportPreviewModal
                            projectId={projectId}
                            exportId={createExportData.project.exportCreate.result.id}
                            onCloseButtonClick={handlePreviewClose}
                        />
                    )}
                </div>
                <LeadsSelection
                    className={styles.leadsTableContainer}
                    projectId={projectId}
                    filterOnlyUnprotected={filterOnlyUnprotected}
                    selectedLeads={selectedLeads}
                    onSelectLeadChange={setSelectedLeads}
                    selectAll={selectAll}
                    onSelectAllChange={setSelectAll}
                    filterValues={sourcesFilters}
                    onFilterApply={setSourcesFilterValue}
                />
            </div>
        </div>
    );
}

export default NewExport;
