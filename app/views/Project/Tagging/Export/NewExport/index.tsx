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
} from '@the-deep/deep-ui';
import { useQuery } from '@apollo/client';
import {
    ProjectFrameworkDetailsQuery,
    ProjectFrameworkDetailsQueryVariables,
    SourceFilterOptionsQueryVariables,
    ExportFormatEnum,
} from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import _ts from '#ts';

import AdvancedOptionsSelection from './AdvancedOptionsSelection';
import ExportTypeButton from './ExportTypeButton';
import LeadsSelection from '../LeadsSelection';
import {
    ExportTypeItem,
    TreeSelectableWidget,
    AnalysisFramework,
    Node,
} from '../types';
import {
    filterContexualWidgets,
    createReportStructure,
    getWidgets,
    SECTOR_FIRST,
} from '../utils';

import { PROJECT_FRAMEWORK_DETAILS } from './queries';
import styles from './styles.css';

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
    const [filterValues, setFilterValues] = useState<Omit<SourceFilterOptionsQueryVariables, 'projectId'>>({});

    // advanced-options
    const [reportShowGroups, setReportShowGroups] = useState<boolean>(true);
    const [reportShowLeadEntryId, setReportShowLeadEntryId] = useState<boolean>(true);
    const [reportShowAssessmentData, setReportShowAssessmentData] = useState<boolean>(true);
    const [reportShowEntryWidgetData, setReportShowEntryWidgetData] = useState<boolean>(true);
    const [textWidgets, setTextWidgets] = useState<TreeSelectableWidget[]>([]);
    const [contextualWidgets, setContextualWidgets] = useState<TreeSelectableWidget[]>([]);
    const [reportStructure, setReportStructure] = useState<Node[] | undefined>();
    const [includeSubSector, setIncludeSubSector] = useState<boolean>(false);
    const [reportStructureVariant, setReportStructureVariant] = useState<string>(SECTOR_FIRST);
    const [excelDecoupled, setExcelDecoupled] = useState<boolean>(true);

    const [
        advancedOptionsModalShown,
        showAdvancedOptionsModal,
        hideAdvancedOptionsModal,
    ] = useModalState(false);

    const { project } = React.useContext(ProjectContext);
    const filterOnlyUnprotected = !!project?.allowedPermissions?.includes('VIEW_ONLY_UNPROTECTED_LEAD');

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
    console.warn('loading', frameworkGetPending, frameworkResponse);

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

    const handleExport = () => { }; //eslint-disable-line
    const handlePreviewClick = () => { }; //eslint-disable-line

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
                            disabled={frameworkGetPending}
                            onClick={handleExport}
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
                </div>
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
            </div>
        </div>
    );
}

export default NewExport;
