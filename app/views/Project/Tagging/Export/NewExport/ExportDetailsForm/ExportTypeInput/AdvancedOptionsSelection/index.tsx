import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ContainerCard,
    Card,
    Checkbox,
    Heading,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import {
    ExportFormatEnum,
    ProjectFrameworkDetailsQuery,
    ProjectFrameworkDetailsQueryVariables,
} from '#generated/types';
import TreeSelection from '#components/TreeSelection';
import _ts from '#ts';

import {
    TreeSelectableWidget,
    AnalysisFramework,
    Node,
} from '../../../../types';
import {
    filterContexualWidgets,
    createReportStructure,
    getWidgets,
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '../../../../utils';

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

interface Props {
    exportFileFormat: ExportFormatEnum;
}
function AdvancedOptionsSelection(props: Props) {
    const {
        exportFileFormat,
    } = props;

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

    const projectId = '1';
    const variables = useMemo(
        (): ProjectFrameworkDetailsQueryVariables => ({
            projectId,
        }),
        [projectId],
    );

    const {
        loading: frameworkGetPending, // TODO: disable export button when frameworkGetPending
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

    const handleSwapOrderValueChange = useCallback((newValue) => {
        if (newValue) {
            setReportStructureVariant(DIMENSION_FIRST);
        } else {
            setReportStructureVariant(SECTOR_FIRST);
        }
    }, []);

    const swapOrderValue = useMemo(() => (
        reportStructureVariant === DIMENSION_FIRST
    ), [reportStructureVariant]);

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

    // TODO: previously true when entryFilterOptions had projectLabels;
    const showEntryGroupsSelection = false;

    return (
        <div>
            <div>
                Left
                <div>
                    {(exportFileFormat === 'DOCX' || exportFileFormat === 'PDF') && (
                        <div>
                            <ContainerCard
                                headingSize="extraSmall"
                                heading={_ts('export', 'contentSettingsText')}
                            >
                                {showEntryGroupsSelection && (
                                    <Checkbox
                                        name="reportShowGroups"
                                        label={_ts('export', 'showEntryGroupsLabel')}
                                        value={reportShowGroups}
                                        onChange={setReportShowGroups}
                                    />
                                )}
                                <Checkbox
                                    name="reportShowLeadEntryId"
                                    label={_ts('export', 'showEntryIdLabel')}
                                    value={reportShowLeadEntryId}
                                    onChange={setReportShowLeadEntryId}
                                />
                                <Checkbox
                                    name="reportShowAssessmentData"
                                    label={_ts('export', 'showAryDetailLabel')}
                                    value={reportShowAssessmentData}
                                    onChange={setReportShowAssessmentData}
                                />
                                <Checkbox
                                    name="showAdditionalMetaData"
                                    label={_ts('export', 'showAdditionalMetadataLabel')}
                                    value={reportShowEntryWidgetData}
                                    onChange={setReportShowEntryWidgetData}
                                />
                            </ContainerCard>
                            <ContainerCard>
                                {contextualWidgets.length > 0 && reportShowEntryWidgetData && (
                                    <div>
                                        <Heading size="extraSmall">
                                            Contextual Widgets
                                        </Heading>
                                        <TreeSelection
                                            name="contextualWidgets"
                                            value={contextualWidgets}
                                            onChange={setContextualWidgets}
                                            direction="vertical"
                                        />
                                    </div>
                                )}
                                {textWidgets.length > 0 && (
                                    <div>
                                        <Heading size="extraSmall">
                                            Free Text Widgets
                                        </Heading>
                                        <TreeSelection
                                            name="freeTextWidgets"
                                            value={textWidgets}
                                            onChange={setTextWidgets}
                                            direction="vertical"
                                        />
                                    </div>
                                )}
                            </ContainerCard>
                            <ContainerCard
                                headingSize="extraSmall"
                                heading="Structure"
                            >
                                <TreeSelection
                                    name="treeSelection"
                                    value={reportStructure}
                                    onChange={setReportStructure}
                                />
                                {showMatrix2dOptions && (
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            label={_ts('export', 'includeSubSector')}
                                            value={includeSubSector}
                                            onChange={setIncludeSubSector}
                                        />
                                        <Checkbox
                                            name="swap-checkbox"
                                            label={_ts('export', 'swapColumnRowsLabel')}
                                            value={swapOrderValue}
                                            onChange={handleSwapOrderValueChange}
                                        />
                                    </div>
                                )}
                            </ContainerCard>
                        </div>
                    )}
                    {(exportFileFormat === 'XLSX') && (
                        <Card>
                            <Checkbox
                                name="excelDecoupled"
                                label={_ts('export', 'decoupledEntriesLabel')}
                                value={excelDecoupled}
                                onChange={setExcelDecoupled}
                            />
                            <div key="info">
                                <p>{_ts('export', 'decoupledEntriesTitle2')}</p>
                                <p>{_ts('export', 'decoupledEntriesTitle')}</p>
                            </div>
                        </Card>
                    )}
                </div>
                <div>
                    Preview
                </div>
            </div>
        </div>
    );
}

export default AdvancedOptionsSelection;
