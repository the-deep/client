import React, { useMemo, useCallback } from 'react';
import {
    Container,
    Modal,
    Checkbox,
} from '@the-deep/deep-ui';

import TreeSelection from '#components/TreeSelection';
import { ExportFormatEnum } from '#generated/types';
import _ts from '#ts';

import EntryPreview from '../EntryPreview';
import {
    TreeSelectableWidget,
    Node,
} from '../../types';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '../../utils';

import styles from './styles.css';

interface Props {
    onCloseButtonClick: () => void;
    exportFileFormat: ExportFormatEnum;
    reportStructureVariant: string;
    excelDecoupled: boolean;
    reportShowLeadEntryId: boolean;
    reportShowAssessmentData: boolean;
    reportShowEntryWidgetData: boolean;
    includeSubSector: boolean;
    showMatrix2dOptions: boolean;
    textWidgets: TreeSelectableWidget[];
    contextualWidgets: TreeSelectableWidget[];
    reportStructure?: Node[];
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
        onCloseButtonClick,
        exportFileFormat,
        excelDecoupled,
        reportStructure,
        reportStructureVariant,
        reportShowLeadEntryId,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        includeSubSector,
        showMatrix2dOptions,
        contextualWidgets,
        textWidgets,
        onReportStructureChange,
        onReportStructureVariantChange,
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

    return (
        <Modal
            className={styles.modal}
            size={exportFileFormat === 'XLSX' ? 'small' : 'large'}
            heading="Advanced Options"
            onCloseButtonClick={onCloseButtonClick}
            bodyClassName={styles.body}
            freeHeight
        >
            {(exportFileFormat === 'DOCX' || exportFileFormat === 'PDF') && (
                <div className={styles.reportOptions}>
                    <p className={styles.note}>
                        The values shown are based on filters from the main export page
                    </p>
                    <div className={styles.optionsContainer}>
                        <div className={styles.left}>
                            <Container
                                className={styles.container}
                                headingSize="extraSmall"
                                heading="Metadata to show"
                                contentClassName={styles.containerContent}
                            >
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
                            </Container>
                            {contextualWidgets.length > 0 && reportShowEntryWidgetData && (
                                <Container
                                    className={styles.container}
                                    heading="Contextual Widgets"
                                    headingSize="extraSmall"
                                >
                                    <TreeSelection
                                        name="contextualWidgets"
                                        value={contextualWidgets}
                                        onChange={onContextualWidgetsChange}
                                        direction="vertical"
                                    />
                                </Container>
                            )}
                            {textWidgets.length > 0 && (
                                <Container
                                    className={styles.container}
                                    spacing="loose"
                                    heading="Free Text Widgets"
                                    headingSize="extraSmall"
                                >
                                    <TreeSelection
                                        name="freeTextWidgets"
                                        value={textWidgets}
                                        onChange={onTextWidgetsChange}
                                        direction="vertical"
                                    />
                                </Container>
                            )}
                        </div>
                        <Container
                            className={styles.container}
                            headingSize="extraSmall"
                            heading="Structure"
                            headingDescriptionClassName={styles.headingDescription}
                            headingDescription={showMatrix2dOptions && (
                                <>
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
                                </>
                            )}
                        >
                            <TreeSelection
                                name="treeSelection"
                                value={reportStructure}
                                onChange={onReportStructureChange}
                                checkboxHidden
                            />
                        </Container>
                        <EntryPreview
                            className={styles.entryPreview}
                            showLeadEntryId={reportShowLeadEntryId}
                            showAssessmentData={reportShowAssessmentData}
                            showEntryWidgetData={reportShowEntryWidgetData}
                            contextualWidgets={contextualWidgets}
                        />
                    </div>
                </div>
            )}
            {(exportFileFormat === 'XLSX') && (
                <>
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
                </>
            )}
        </Modal>
    );
}

export default AdvancedOptionsSelection;
