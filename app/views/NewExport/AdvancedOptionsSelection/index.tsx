import React, { useMemo, useCallback } from 'react';
import {
    Container,
    Modal,
    Checkbox,
    Tag,
    RadioInput,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import TreeSelection from '#components/TreeSelection';
import {
    ExportFormatEnum,
    ExportEnumsQuery,
    ExportDateFormatEnum,
    ExportReportCitationStyleEnum,
} from '#generated/types';
import _ts from '#ts';
import EntryPreview from '../EntryPreview';
import {
    TreeSelectableWidget,
    Node,
} from '../types';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '../utils';

import { ExcelColumnNode } from '..';
import styles from './styles.css';

const EXPORT_ENUMS = gql`
    query ExportEnums {
        enums {
            ExportExtraOptionsSerializerDateFormat {
                description
                enum
                label
            }
            ExportExtraOptionsSerializerReportCitationStyle {
                description
                enum
                label
            }
        }
    }
`;
interface DateFormatOption {
    enum: ExportDateFormatEnum;
    label: string;
}
const dateFormatKeySelector = (item: DateFormatOption) => item.enum;
const dateFormatLabelSelector = (item: DateFormatOption) => item.label;

interface CitationFormatOption {
    enum: ExportReportCitationStyleEnum;
    label: string;
    description?: string | null | undefined;
}
const citationFormatKeySelector = (item: CitationFormatOption) => item.enum;
const citationFormatLabelSelector = (item: CitationFormatOption) => item.description ?? item.label;

function columnsLabelSelector(node: ExcelColumnNode) {
    const isEntryMetadata = node.key.includes('ENTRY');

    return (
        <div className={styles.columnLabel}>
            {node.title}
            {node.isWidget && (
                <Tag
                    className={styles.tag}
                    spacing="compact"
                    variant="gradient1"
                >
                    Tag
                </Tag>
            )}
            {(!node.isWidget && isEntryMetadata) && (
                <Tag
                    className={styles.tag}
                    spacing="compact"
                    variant="gradient2"
                >
                    Entry
                </Tag>
            )}
            {(!node.isWidget && !isEntryMetadata) && (
                <Tag
                    className={styles.tag}
                    spacing="compact"
                    variant="complement1"
                >
                    Lead
                </Tag>
            )}
        </div>
    );
}

const exportTypeTitle: { [key in ExportFormatEnum]: string } = {
    DOCX: 'Word',
    XLSX: 'Excel',
    PDF: 'PDF',
    CSV: 'CSV',
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
    widgetColumns: ExcelColumnNode[];
    onWidgetColumnChange: (value: ExcelColumnNode[]) => void;
    dateFormat: ExportDateFormatEnum | undefined;
    citationFormat: ExportReportCitationStyleEnum | undefined;
    onDateFormatChange: (newVal: ExportDateFormatEnum | undefined) => void;
    onCitationFormatChange: (newVal: ExportReportCitationStyleEnum | undefined) => void;
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
        widgetColumns,
        onWidgetColumnChange,
        dateFormat,
        onDateFormatChange,
        citationFormat,
        onCitationFormatChange,
    } = props;

    const {
        data: exportEnums,
    } = useQuery<ExportEnumsQuery>(
        EXPORT_ENUMS,
    );

    const handleSwapOrderValueChange = useCallback((newValue: boolean) => {
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
            className={exportFileFormat !== 'XLSX' ? styles.reportModal : styles.excelModal}
            heading={`Advanced Options - ${exportTypeTitle[exportFileFormat]}`}
            onCloseButtonClick={onCloseButtonClick}
            bodyClassName={styles.body}
            size="large"
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
                        <div className={styles.midPane}>
                            <Container
                                className={styles.container}
                                spacing="loose"
                                heading="Extra Options"
                                headingSize="extraSmall"
                                contentClassName={styles.containerBody}
                            >
                                <RadioInput
                                    label="Date formats"
                                    onChange={onDateFormatChange}
                                    name={undefined}
                                    value={dateFormat}
                                    options={exportEnums?.enums
                                        ?.ExportExtraOptionsSerializerDateFormat ?? undefined}
                                    keySelector={dateFormatKeySelector}
                                    labelSelector={dateFormatLabelSelector}
                                />
                                <RadioInput
                                    label="Citation formats"
                                    onChange={onCitationFormatChange}
                                    name={undefined}
                                    value={citationFormat}
                                    options={exportEnums?.enums
                                        ?.ExportExtraOptionsSerializerReportCitationStyle
                                    ?? undefined}
                                    keySelector={citationFormatKeySelector}
                                    labelSelector={citationFormatLabelSelector}
                                />
                            </Container>
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
                        </div>
                        <EntryPreview
                            className={styles.entryPreview}
                            showLeadEntryId={reportShowLeadEntryId}
                            showAssessmentData={reportShowAssessmentData}
                            showEntryWidgetData={reportShowEntryWidgetData}
                            contextualWidgets={contextualWidgets}
                            textWidgets={textWidgets}
                            citationFormat={citationFormat}
                            dateFormat={dateFormat}
                        />
                    </div>
                </div>
            )}
            {(exportFileFormat === 'XLSX') && (
                <div className={styles.excelOptionsContainer}>
                    <div className={styles.excelInfo}>
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
                        <Container
                            className={styles.container}
                            spacing="loose"
                            heading="Extra Options"
                            headingSize="extraSmall"
                        >
                            <RadioInput
                                label="Date formats"
                                onChange={onDateFormatChange}
                                name={undefined}
                                value={dateFormat}
                                options={exportEnums?.enums
                                    ?.ExportExtraOptionsSerializerDateFormat ?? undefined}
                                keySelector={dateFormatKeySelector}
                                labelSelector={dateFormatLabelSelector}
                            />
                        </Container>
                    </div>
                    {widgetColumns.length > 0 && (
                        <Container
                            className={styles.excelColumnsContainer}
                            heading="Columns"
                            headingSize="extraSmall"
                        >
                            <TreeSelection
                                name="columns"
                                value={widgetColumns}
                                labelSelector={columnsLabelSelector}
                                onChange={onWidgetColumnChange}
                                direction="vertical"
                            />
                        </Container>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default AdvancedOptionsSelection;
