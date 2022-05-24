import React, { useMemo, useCallback } from 'react';
import {
    ContainerCard,
    Card,
    Checkbox,
    Heading,
} from '@the-deep/deep-ui';
import {
    ExportFormatEnum,
} from '#generated/types';
import TreeSelection from '#components/TreeSelection';
import _ts from '#ts';

import {
    TreeSelectableWidget,
    Node,
} from '../../types';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '../../utils';

interface Props {
    exportFileFormat: ExportFormatEnum;
    reportStructureVariant: string;
    excelDecoupled: boolean;
    reportShowGroups: boolean;
    reportShowLeadEntryId: boolean;
    reportShowAssessmentData: boolean;
    reportShowEntryWidgetData: boolean;
    includeSubSector: boolean;
    showMatrix2dOptions: boolean;
    textWidgets: TreeSelectableWidget[];
    contextualWidgets: TreeSelectableWidget[];
    reportStructure?: Node[];
    onReportShowGroupsChange: (show: boolean) => void;
    onReportShowLeadEntryIdChange: (show: boolean) => void;
    onReportShowAssessmentDataChange: (show: boolean) => void;
    onReportShowEntryWidgetDataChange: (show: boolean) => void;
    onReportStructureChange: (reports: Node[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onExcelDecoupledChange: (value: boolean) => void;
    onIncludeSubSectorChange: (value: boolean) => void;
    onContextualWidgetsChange: (value: TreeSelectableWidget[]) => void;
    onTextWidgetsChange: (value: TreeSelectableWidget[]) => void;
}
function AdvancedOptionsSelection(props: Props) {
    const {
        exportFileFormat,
        excelDecoupled,
        reportStructure,
        reportStructureVariant,
        reportShowGroups,
        reportShowLeadEntryId,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        includeSubSector,
        showMatrix2dOptions,
        contextualWidgets,
        textWidgets,
        onReportStructureChange,
        onReportStructureVariantChange,
        onReportShowGroupsChange,
        onReportShowLeadEntryIdChange,
        onReportShowAssessmentDataChange,
        onReportShowEntryWidgetDataChange,
        onIncludeSubSectorChange,
        onContextualWidgetsChange,
        onTextWidgetsChange,
        onExcelDecoupledChange,
    } = props;

    const handleSwapOrderValueChange = useCallback((newValue) => {
        if (newValue) {
            onReportStructureVariantChange(DIMENSION_FIRST);
        } else {
            onReportStructureVariantChange(SECTOR_FIRST);
        }
    }, [onReportStructureVariantChange]);

    const swapOrderValue = useMemo(() => (
        reportStructureVariant === DIMENSION_FIRST
    ), [reportStructureVariant]);

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
                                        onChange={onReportShowGroupsChange}
                                    />
                                )}
                                <Checkbox
                                    name="reportShowLeadEntryId"
                                    label={_ts('export', 'showEntryIdLabel')}
                                    value={reportShowLeadEntryId}
                                    onChange={onReportShowLeadEntryIdChange}
                                />
                                <Checkbox
                                    name="reportShowAssessmentData"
                                    label={_ts('export', 'showAryDetailLabel')}
                                    value={reportShowAssessmentData}
                                    onChange={onReportShowAssessmentDataChange}
                                />
                                <Checkbox
                                    name="showAdditionalMetaData"
                                    label={_ts('export', 'showAdditionalMetadataLabel')}
                                    value={reportShowEntryWidgetData}
                                    onChange={onReportShowEntryWidgetDataChange}
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
                                            onChange={onContextualWidgetsChange}
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
                                            onChange={onTextWidgetsChange}
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
                                    onChange={onReportStructureChange}
                                />
                                {showMatrix2dOptions && (
                                    <div>
                                        <Checkbox
                                            name="checkbox"
                                            label={_ts('export', 'includeSubSector')}
                                            value={includeSubSector}
                                            onChange={onIncludeSubSectorChange}
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
                                onChange={onExcelDecoupledChange}
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
