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
} from '#views/Export/types';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '#views/Export/utils';

import styles from './styles.css';

const exportTypeTitle: { [key in ExportFormatEnum]: string } = {
    DOCX: 'Word',
    XLSX: 'Excel',
    PDF: 'PDF',
    JSON: 'JSON',
};

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
            className={exportFileFormat !== 'XLSX' ? styles.modal : undefined}
            size={exportFileFormat === 'XLSX' ? 'small' : 'large'}
            heading={`Advanced Options - ${exportTypeTitle[exportFileFormat]}`}
            onCloseButtonClick={onCloseButtonClick}
            bodyClassName={styles.body}
        >
            {(exportFileFormat === 'DOCX' || exportFileFormat === 'PDF') && (
                <div className={styles.reportOptions}>
                    <p className={styles.note}>
                        Tailor the content and structure of your export
                        using the content of your framework as well additional metadata.
                    </p>
                    <div className={styles.optionsContainer}>
                        <div className={styles.left}>
                            <Container
                                className={styles.container}
                                headingSize="extraSmall"
                                heading="Metadata"
                                contentClassName={styles.containerContent}
                            >
                                <Checkbox
                                    name="reportShowLeadEntryId"
                                    label="Entry ID"
                                    value={reportShowLeadEntryId}
                                    onChange={onReportShowLeadEntryIdChange}
                                />
                                <Checkbox
                                    name="reportShowAssessmentData"
                                    label="Assessment Registry Information"
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
                                    heading="Widgets"
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
                            headerDescriptionClassName={styles.headingDescription}
                            headerDescription={showMatrix2dOptions && (
                                <>
                                    <Checkbox
                                        name="checkbox"
                                        label="Include 2D Matrix subsectors"
                                        value={includeSubSector}
                                        onChange={onIncludeSubSectorChange}
                                    />
                                    <Checkbox
                                        name="swap-checkbox"
                                        label="Swap columns and rows in 2D Matrix order"
                                        value={swapOrderValue}
                                        onChange={handleSwapOrderValueChange}
                                    />
                                </>
                            )}
                            headingDescription={(
                                <p className={styles.info}>
                                    Options shown are based on dimensions
                                    available after filtering from the main export page
                                </p>
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
                            textWidgets={textWidgets}
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
