import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    useAlert,
    ExpandableContainer,
    TextInput,
} from '@the-deep/deep-ui';
import { gql, useQuery, useMutation } from '@apollo/client';

import _ts from '#ts';
import {
    Lead,
} from '#types';
import {
    ProjectFrameworkDetailsQuery,
    ProjectFrameworkDetailsQueryVariables,
    SourceFilterOptionsQueryVariables,
    CreateExportMutation,
    CreateExportMutationVariables,
    ExportExportTypeEnum,
    ExportFormatEnum,
} from '#generated/types';
import { generateFilename } from '#utils/common';
import ProjectContext from '#base/context/ProjectContext';
import {
    Node,
    TreeSelectableWidget,
    Widget,
    AnalysisFramework,
} from '../types';
import {
    SECTOR_FIRST,
    createReportStructure,
    getWidgets,
} from '../utils';
import ExportPreview from '../ExportPreview';
import LeadsSelection from '../LeadsSelection';
import ExportTypePane from './ExportTypePane';

import styles from './styles.css';

const PROJECT_FRAMEWORK_DETAILS = gql`
    query ProjectFrameworkDetails($projectId: ID!) {
        project(id: $projectId) {
            analysisFramework {
                id
                exportables {
                    data
                    id
                    inline
                    order
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                }
                primaryTagging {
                    widgets {
                        id
                        clientId
                        key
                        order
                        properties
                        title
                        widgetId
                        width
                    }
                    clientId
                    id
                    order
                    title
                    tooltip
                }
                secondaryTagging {
                    clientId
                    id
                    key
                    order
                    title
                    properties
                    widgetId
                    width
                }
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

const mapExportType: Record<ExportFormatEnum, ExportExportTypeEnum> = {
    DOCX: 'REPORT',
    PDF: 'REPORT',
    JSON: 'JSON',
    XLSX: 'EXCEL',
};

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
            ...(node.nodes && { levels: createReportStructureForExport(node.nodes) }),
        }))
);

const createReportLevels = (nodes: Node[]): ReportStructureLevel[] => (
    nodes
        .filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            title: node.title,
            ...(node.nodes && { sublevels: createReportLevels(node.nodes) }),
        }))
);

const createWidgetIds = (widgets: TreeSelectableWidget<string>[]) => (
    widgets
        .filter((widget) => widget.selected)
        .map((widget) => +(widget.id))

);

export interface SelectedLead extends Lead {
    selected: boolean;
}
interface Props {
    className?: string;
    projectId: string;
}

function filterContexualWidgets(widgets: Widget[] | undefined) {
    const contextualWidgets = widgets?.filter((v) => v.widgetId === 'SELECT'
        || 'MULTISELECT'
        || 'SCALE'
        || 'GEO'
        || 'TIME'
        || 'DATE'
        || 'ORGANIGRAM'
        || 'DATE_RANGE'
        || 'TIME_RANGE');

    return contextualWidgets;
}

function EntriesExportSelection(props: Props) {
    const {
        className,
        projectId,
    } = props;
    const alert = useAlert();

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<string | undefined>(undefined);
    const [activeExportFormat, setActiveExportFormat] = useState<ExportFormatEnum>('DOCX');
    const [excelDecoupled, setExcelDecoupled] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget<string>[]>([]);
    const [reportShowGroups, setReportShowGroups] = useState<boolean>(true);
    const [reportShowLeadEntryId, setReportShowLeadEntryId] = useState<boolean>(true);
    const [reportShowAssessmentData, setReportShowAssessmentData] = useState<boolean>(true);
    const [reportShowEntryWidgetData, setReportShowEntryWidgetData] = useState<boolean>(true);
    const [reportStructure, setReportStructure] = useState<Node[]>([]);
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [filterValues, setFilterValues] = useState<Omit<SourceFilterOptionsQueryVariables, 'projectId'>>({});

    const [
        reportStructureVariant,
        setReportStructureVariant,
    ] = useState<string>(SECTOR_FIRST);
    const [
        contextualWidgets,
        setContextualWidgets,
    ] = useState<TreeSelectableWidget<string>[]>([]);

    const variables = useMemo(
        (): ProjectFrameworkDetailsQueryVariables => ({
            projectId,
        }),
        [projectId],
    );

    const {
        loading: frameworkGetPending,
        data: frameworkResponse,
    } = useQuery<ProjectFrameworkDetailsQuery, ProjectFrameworkDetailsQueryVariables>(
        PROJECT_FRAMEWORK_DETAILS,
        {
            variables,
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

    const [
        createExport,
        {
            loading: createExportPending,
        },
    ] = useMutation<CreateExportMutation, CreateExportMutationVariables>(
        CREATE_EXPORT,
        {
            refetchQueries: [
                'ProjectExports',
            ],
            onCompleted: (response) => {
                if (response?.project?.exportCreate?.ok) {
                    if (response.project.exportCreate.result?.isPreview) {
                        setPreviewId(response.project.exportCreate.result?.id);
                    } else {
                        alert.show(
                            _ts('export', 'exportStartedNotifyMessage'),
                            { variant: 'success' },
                        );
                    }
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

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

    const startExport = useCallback((preview: boolean) => {
        const exportType = mapExportType[activeExportFormat];
        // NOTE: structure and level depict the same thing but are different in structure
        // levels require the sublevels to be named sublevels whereas structure requires
        // sublevels to be names levels
        // This cannot be fixed immediately in server as it requires migration
        const reportLevels = createReportLevels(
            reportStructure,
        )
            .map((node) => ({
                id: node.id,
                levels: node.sublevels,
            }));
        const generatedReportStructure = createReportStructureForExport(reportStructure);
        const reportTextWidgetIds = createWidgetIds(textWidgets);
        const reportExportingWidgets = createWidgetIds(contextualWidgets);
        const defaultTitle = generateFilename('Entries_Export', activeExportFormat.toLowerCase());

        const data = {
            excelDecoupled,
            exportType,
            filters: {
                ...filterValues,
                ids: selectedLeads,
                excludeProvidedLeadsId: selectAll,
            },
            format: activeExportFormat,
            isPreview: preview,
            reportExportingWidgets,
            reportLevels,
            reportShowAssessmentData,
            reportShowEntryWidgetData,
            reportShowGroups,
            reportShowLeadEntryId,
            reportStructure: generatedReportStructure,
            reportTextWidgetIds,
            type: 'ENTRIES' as const,
            title: queryTitle ?? defaultTitle,
        };

        createExport({
            variables: {
                projectId,
                data,
            },
        });
    }, [
        activeExportFormat,
        contextualWidgets,
        createExport,
        excelDecoupled,
        filterValues,
        queryTitle,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        reportShowGroups,
        reportShowLeadEntryId,
        reportStructure,
        selectAll,
        selectedLeads,
        textWidgets,
        projectId,
    ]);

    const handleEntryExport = useCallback(() => {
        startExport(false);
    }, [startExport]);

    const handleEntryPreview = useCallback(() => {
        setPreviewId(undefined);
        startExport(true);
    }, [setPreviewId, startExport]);

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
                            activeExportFormat={activeExportFormat}
                            reportStructure={reportStructure}
                            reportStructureVariant={reportStructureVariant}
                            excelDecoupled={excelDecoupled}
                            reportShowGroups={reportShowGroups}
                            reportShowLeadEntryId={reportShowLeadEntryId}
                            reportShowAssessmentData={reportShowAssessmentData}
                            reportShowEntryWidgetData={reportShowEntryWidgetData}
                            onActiveExportFormatChange={setActiveExportFormat}
                            onReportStructureChange={setReportStructure}
                            onReportShowGroupsChange={setReportShowGroups}
                            onReportShowLeadEntryIdChange={setReportShowLeadEntryId}
                            onReportShowAssessmentDataChange={setReportShowAssessmentData}
                            onReportShowEntryWidgetDataChange={setReportShowEntryWidgetData}
                            onReportStructureVariantChange={setReportStructureVariant}
                            onExcelDecoupledChange={setExcelDecoupled}
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
                        </div>
                    </ExpandableContainer>
                </div>
                <Button
                    name="startExport"
                    variant="primary"
                    className={styles.exportButton}
                    onClick={handleEntryExport}
                    disabled={frameworkGetPending || createExportPending}
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
