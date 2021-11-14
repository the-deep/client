import React, { useMemo, useCallback } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
    Checkbox,
    List,
    ExpandableContainer,
    Container,
    Heading,
} from '@the-deep/deep-ui';
import {
    AiFillFilePdf,
    AiFillFileExcel,
    AiFillFileWord,
    AiFillFileText,
} from 'react-icons/ai';

import {
    ExportFormatEnum,
} from '#generated/types';

import _ts from '#ts';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '../../../utils';

import TreeSelection from '#components/TreeSelection';

import { Node, TreeSelectableWidget } from '../../../types';
import ExportTypePaneButton from './ExportTypeButton';

import styles from './styles.css';

interface ExportTypeItem {
    key: ExportFormatEnum;
    icon: React.ReactNode;
    title: string;
}

interface Props {
    reportStructure?: Node[];
    activeExportFormat: ExportFormatEnum;
    reportStructureVariant: string;
    excelDecoupled: boolean;
    reportShowGroups: boolean;
    reportShowLeadEntryId: boolean;
    reportShowAssessmentData: boolean;
    reportShowEntryWidgetData: boolean;
    onReportShowGroupsChange: (show: boolean) => void;
    onReportShowLeadEntryIdChange: (show: boolean) => void;
    onReportShowAssessmentDataChange: (show: boolean) => void;
    onReportShowEntryWidgetDataChange: (show: boolean) => void;
    onActiveExportFormatChange: (type: ExportFormatEnum) => void;
    onReportStructureChange: (reports: Node[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onExcelDecoupledChange: (value: boolean) => void;
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showMatrix2dOptions: boolean;
    contextualWidgets: TreeSelectableWidget<string>[];
    onSetContextualWidgets: (value: TreeSelectableWidget<string>[]) => void;
    textWidgets: TreeSelectableWidget<string>[];
    onSetTextWidgets: (value: TreeSelectableWidget<string>[]) => void;
}

const exportTypes: ExportTypeItem[] = [
    {
        key: 'DOCX',
        icon: <AiFillFileWord />,
        title: _ts('export', 'docxLabel'),
    },
    {
        key: 'PDF',
        icon: <AiFillFilePdf />,
        title: _ts('export', 'pdfLabel'),
    },
    {
        key: 'XLSX',
        icon: <AiFillFileExcel />,
        title: _ts('export', 'xlsxLabel'),
    },
    {
        key: 'JSON',
        icon: <AiFillFileText />,
        title: _ts('export', 'jsonLabel'),
    },
];

const exportTypeKeyExtractor = (d: ExportTypeItem) => d.key;

interface RenderWordProps {
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showMatrix2dOptions: boolean;
    onReportStructureChange: (reports: Node[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onReportShowGroupsChange: (show: boolean) => void;
    onReportShowLeadEntryIdChange: (show: boolean) => void;
    onReportShowAssessmentDataChange: (show: boolean) => void;
    onReportShowEntryWidgetDataChange: (show: boolean) => void;
    reportStructure?: Node[];
    reportStructureVariant: string;
    reportShowGroups: boolean;
    reportShowLeadEntryId: boolean;
    reportShowAssessmentData: boolean;
    reportShowEntryWidgetData: boolean;
    contextualWidgets: TreeSelectableWidget<string>[];
    onSetContextualWidgets: (value: TreeSelectableWidget<string>[]) => void;
    textWidgets: TreeSelectableWidget<string>[];
    onSetTextWidgets: (value: TreeSelectableWidget<string>[]) => void;
}

function RenderWordPdfOptions(props: RenderWordProps) {
    const {
        onReportStructureChange,
        onReportStructureVariantChange,
        onReportShowGroupsChange,
        onReportShowLeadEntryIdChange,
        onReportShowAssessmentDataChange,
        onReportShowEntryWidgetDataChange,
        reportStructure,
        reportStructureVariant,
        reportShowGroups,
        reportShowLeadEntryId,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
        contextualWidgets,
        onSetContextualWidgets,
        textWidgets,
        onSetTextWidgets,
    } = props;

    const swapOrderValue = useMemo(() => (
        reportStructureVariant === DIMENSION_FIRST
    ), [reportStructureVariant]);

    const handleSwapOrderValueChange = useCallback((newValue) => {
        if (newValue) {
            onReportStructureVariantChange(DIMENSION_FIRST);
        } else {
            onReportStructureVariantChange(SECTOR_FIRST);
        }
    }, [onReportStructureVariantChange]);

    if (!reportStructure) {
        return (
            <p>
                { _ts('export', 'noMatrixAfText')}
            </p>
        );
    }
    // TODO previously true when entryFilterOptions had projectLabels;
    const showEntryGroupsSelection = false;

    return (
        <>
            <Container
                className={styles.contentSettings}
                headingSize="extraSmall"
                heading={_ts('export', 'contentSettingsText')}
            >
                {showEntryGroupsSelection && (
                    <Checkbox
                        name="reportShowGroups"
                        label={_ts('export', 'showEntryGroupsLabel')}
                        value={reportShowGroups}
                        onChange={onReportShowGroupsChange}
                        className={styles.checkbox}
                    />
                )}
                <Checkbox
                    name="reportShowLeadEntryId"
                    label={_ts('export', 'showEntryIdLabel')}
                    value={reportShowLeadEntryId}
                    onChange={onReportShowLeadEntryIdChange}
                    className={styles.checkbox}
                />
                <Checkbox
                    name="reportShowAssessmentData"
                    label={_ts('export', 'showAryDetailLabel')}
                    value={reportShowAssessmentData}
                    onChange={onReportShowAssessmentDataChange}
                    className={styles.checkbox}
                />
                <Checkbox
                    name="showAdditionalMetaData"
                    label={_ts('export', 'showAdditionalMetadataLabel')}
                    value={reportShowEntryWidgetData}
                    onChange={onReportShowEntryWidgetDataChange}
                    className={styles.checkbox}
                />
            </Container>
            <Container
                className={styles.reportStructure}
                headingSize="extraSmall"
                heading={_ts('export', 'reportStructureLabel')}
                contentClassName={styles.content}
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
                            className={styles.checkbox}
                        />
                        <Checkbox
                            name="swap-checkbox"
                            label={_ts('export', 'swapColumnRowsLabel')}
                            value={swapOrderValue}
                            onChange={handleSwapOrderValueChange}
                            className={styles.checkbox}
                        />
                    </div>
                )}
            </Container>
            <Container
                className={styles.additional}
                headingSize="extraSmall"
                heading="Additional Metadata"
                contentClassName={styles.content}
            >
                {contextualWidgets.length > 0 && reportShowEntryWidgetData && (
                    <>
                        <Heading
                            size="extraSmall"
                        >
                            Contextual Widgets
                        </Heading>
                        <TreeSelection
                            className={styles.widgetSelection}
                            name="contextualWidgets"
                            value={contextualWidgets}
                            onChange={onSetContextualWidgets}
                            direction="horizontal"
                        />
                    </>
                )}
                {textWidgets.length > 0 && (
                    <>
                        <Heading
                            size="extraSmall"
                        >
                            Free Text Widgets
                        </Heading>
                        <TreeSelection
                            className={styles.widgetSelection}
                            name="freeTextWidgets"
                            value={textWidgets}
                            onChange={onSetTextWidgets}
                            direction="horizontal"
                        />
                    </>
                )}
            </Container>
        </>
    );
}

interface RenderExcelProps {
    excelDecoupled: boolean;
    onExcelDecoupledChange: (value: boolean) => void;
}

function RenderExcelOptions(props: RenderExcelProps) {
    const {
        excelDecoupled,
        onExcelDecoupledChange,
    } = props;

    return (
        <>
            <Checkbox
                name="excelDecoupled"
                label={_ts('export', 'decoupledEntriesLabel')}
                value={excelDecoupled}
                onChange={onExcelDecoupledChange}
            />
            <div
                key="info"
            >
                <IoInformationCircleOutline />
                <div>
                    <p>{_ts('export', 'decoupledEntriesTitle2')}</p>
                    <p>{_ts('export', 'decoupledEntriesTitle')}</p>
                </div>
            </div>
        </>
    );
}

function ExportTypePane(props: Props) {
    const {
        onActiveExportFormatChange,
        activeExportFormat,
        reportStructure,
        reportStructureVariant,
        onReportStructureChange,
        onReportStructureVariantChange,
        reportShowGroups,
        reportShowLeadEntryId,
        reportShowAssessmentData,
        reportShowEntryWidgetData,
        onReportShowGroupsChange,
        onReportShowLeadEntryIdChange,
        onReportShowAssessmentDataChange,
        onReportShowEntryWidgetDataChange,
        excelDecoupled,
        onExcelDecoupledChange,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
        contextualWidgets,
        onSetContextualWidgets,
        textWidgets,
        onSetTextWidgets,
    } = props;

    const exportTypeRendererParams = useCallback((key: ExportFormatEnum, data: ExportTypeItem) => {
        const {
            title,
            icon,
        } = data;

        return ({
            buttonKey: key,
            className: styles.exportType,
            title,
            icon,
            isActive: activeExportFormat === key,
            onActiveExportFormatChange,
        });
    }, [activeExportFormat, onActiveExportFormatChange]);

    return (
        <section className={styles.exportTypePane}>
            <Container
                className={styles.exportTypesContainer}
                headingSize="extraSmall"
                heading={_ts('export', 'fileFormatSelectionLabel')}
                inlineHeadingDescription
                contentClassName={styles.content}
            >
                <List
                    data={exportTypes}
                    rendererParams={exportTypeRendererParams}
                    renderer={ExportTypePaneButton}
                    keySelector={exportTypeKeyExtractor}
                />
            </Container>
            <ExpandableContainer
                className={styles.advanced}
                headingSize="extraSmall"
                heading="Advanced"
                defaultVisibility
            >
                {activeExportFormat === ('DOCX' || 'PDF') && (
                    <RenderWordPdfOptions
                        includeSubSector={includeSubSector}
                        onIncludeSubSectorChange={onIncludeSubSectorChange}
                        onReportStructureChange={onReportStructureChange}
                        onReportStructureVariantChange={onReportStructureVariantChange}
                        onReportShowGroupsChange={onReportShowGroupsChange}
                        onReportShowLeadEntryIdChange={onReportShowLeadEntryIdChange}
                        onReportShowAssessmentDataChange={onReportShowAssessmentDataChange}
                        onReportShowEntryWidgetDataChange={onReportShowEntryWidgetDataChange}
                        showMatrix2dOptions={showMatrix2dOptions}
                        reportStructure={reportStructure}
                        reportStructureVariant={reportStructureVariant}
                        reportShowGroups={reportShowGroups}
                        reportShowLeadEntryId={reportShowLeadEntryId}
                        reportShowAssessmentData={reportShowAssessmentData}
                        reportShowEntryWidgetData={reportShowEntryWidgetData}
                        contextualWidgets={contextualWidgets}
                        onSetContextualWidgets={onSetContextualWidgets}
                        textWidgets={textWidgets}
                        onSetTextWidgets={onSetTextWidgets}
                    />
                )}
                {activeExportFormat === 'XLSX' && (
                    <RenderExcelOptions
                        excelDecoupled={excelDecoupled}
                        onExcelDecoupledChange={onExcelDecoupledChange}
                    />
                )}
                {activeExportFormat === 'JSON' && (
                    <p>
                        { _ts('export', 'noOptionsAvailable') }
                    </p>
                )}
            </ExpandableContainer>
        </section>
    );
}

export default ExportTypePane;
