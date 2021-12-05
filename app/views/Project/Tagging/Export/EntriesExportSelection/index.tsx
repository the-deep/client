import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    useAlert,
    ControlledExpandableContainer,
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
    AnalysisFramework,
} from '../types';
import {
    SECTOR_FIRST,
    createReportStructure,
    getWidgets,
} from '../utils';
import { Widget, Level } from '#types/newAnalyticalFramework';
import { getProjectSourcesQueryVariables } from '../../Sources/SourcesFilter';
import ExportPreview from '../ExportPreview';
import LeadsSelection from '../LeadsSelection';
import ExportTypePane from './ExportTypePane';

import styles from './styles.css';

const PROJECT_FRAMEWORK_DETAILS = gql`
    query ProjectFrameworkDetails($projectId: ID!) {
        project(id: $projectId) {
            id
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
                        conditional {
                            parentWidget
                            parentWidgetType
                            conditions
                        }
                        title
                        widgetId
                        width
                        version
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
                    conditional {
                        parentWidget
                        parentWidgetType
                        conditions
                    }
                    widgetId
                    width
                    version
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

const createReportStructureForExport = (nodes: Node[]): ExportReportStructure[] => (
    nodes.filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            ...(node.nodes && { levels: createReportStructureForExport(node.nodes) }),
        }))
);

const createReportLevels = (nodes: Node[]): Level[] => (
    nodes
        .filter((node) => node.selected)
        .map((node) => ({
            id: node.key,
            title: node.title,
            ...(node.nodes && { sublevels: createReportLevels(node.nodes) }),
        }))
);

const createWidgetIds = (widgets: TreeSelectableWidget[]) => (
    // FIXME: we should not cast this value, fix this server
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
    onSuccess: () => void;
}

function filterContexualWidgets(widgets: Widget[] | undefined) {
    const contextualWidgets = widgets?.filter((v) => (
        v.widgetId === 'SELECT'
        || v.widgetId === 'MULTISELECT'
        || v.widgetId === 'SCALE'
        || v.widgetId === 'GEO'
        || v.widgetId === 'TIME'
        || v.widgetId === 'DATE'
        || v.widgetId === 'ORGANIGRAM'
        || v.widgetId === 'DATE_RANGE'
        || v.widgetId === 'TIME_RANGE'
    ));

    return contextualWidgets;
}

function EntriesExportSelection(props: Props) {
    const {
        className,
        projectId,
        onSuccess,
    } = props;

    const alert = useAlert();

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

    const [queryTitle, setQueryTitle] = useState<string>();
    const [previewId, setPreviewId] = useState<string | undefined>(undefined);
    const [activeExportFormat, setActiveExportFormat] = useState<ExportFormatEnum>('DOCX');
    const [excelDecoupled, setExcelDecoupled] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget[]>([]);
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
    ] = useState<TreeSelectableWidget[]>([]);

    const variables = useMemo(
        (): ProjectFrameworkDetailsQueryVariables => ({
            projectId,
        }),
        [projectId],
    );

    const filters = useMemo(() => (
        getProjectSourcesQueryVariables(filterValues)
    ), [filterValues]);

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
                        onSuccess();
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
                ...filters,
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
        filters,
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

    const [expandedStep, setExpandedStep] = useState<'step1' | 'step2' | 'step3' | undefined>('step1');

    const handleStepExpansionChange = useCallback((newState: boolean, step: 'step1' | 'step2' | 'step3') => {
        setExpandedStep(newState ? step : undefined);
    }, []);

    return (
        <div className={_cs(className, styles.export)}>
            <div className={styles.left}>
                <ControlledExpandableContainer
                    headingSize="small"
                    className={styles.section}
                    headerClassName={styles.header}
                    headingClassName={styles.heading}
                    name="step1"
                    expanded={expandedStep === 'step1'}
                    onExpansionChange={handleStepExpansionChange}
                    heading={(
                        <>
                            {_ts('export', 'selectSourcesStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectSourcesHeading')}
                            </span>
                        </>
                    )}
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
                </ControlledExpandableContainer>
                <ControlledExpandableContainer
                    name="step2"
                    expanded={expandedStep === 'step2'}
                    onExpansionChange={handleStepExpansionChange}
                    className={styles.section}
                    headerClassName={styles.header}
                    headingSize="small"
                    headingClassName={styles.heading}
                    heading={(
                        <>
                            {_ts('export', 'selectFormatStylingStepHeading')}
                            <span className={styles.subHeading}>
                                {_ts('export', 'selectFormatStylingHeading')}
                            </span>
                        </>
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
                </ControlledExpandableContainer>
                <ControlledExpandableContainer
                    name="step3"
                    expanded={expandedStep === 'step3'}
                    onExpansionChange={handleStepExpansionChange}
                    className={styles.section}
                    headingSize="small"
                    headerClassName={styles.header}
                    headingClassName={styles.heading}
                    heading={(
                        <>
                            Step 3.
                            <span className={styles.subHeading}>
                                Name your export
                            </span>
                        </>
                    )}
                >
                    <TextInput
                        name="queryTitle"
                        value={queryTitle}
                        onChange={setQueryTitle}
                        label="Export Title"
                    />
                </ControlledExpandableContainer>
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
