import React, { useMemo, useCallback } from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import ListView from '#rscv/List/ListView';

import {
    ExportType,
    ReportStructure,
} from '#types';

import _ts from '#ts';
import {
    SECTOR_FIRST,
    DIMENSION_FIRST,
} from '#utils/framework';

import wordIcon from '#resources/img/word.svg';
import excelIcon from '#resources/img/excel.svg';
import pdfIcon from '#resources/img/pdf.svg';
import jsonIcon from '#resources/img/json.svg';

import ExportTypePaneButton from './ExportTypeButton';

import styles from './styles.scss';

interface ExportTypeItem {
    key: ExportType;
    img: string;
    title: string;
}

interface Props {
    reportStructure?: ReportStructure[];
    entryFilterOptions: {
        projectEntryLabel: [];
    };
    activeExportTypeKey: ExportType;
    reportStructureVariant: string;
    decoupledEntries: boolean;
    showGroups: boolean;
    showEntryId: boolean;
    showAryDetails: boolean;
    showAdditionalMetadata: boolean;
    onShowGroupsChange: (show: boolean) => void;
    onShowEntryIdChange: (show: boolean) => void;
    onShowAryDetailsChange: (show: boolean) => void;
    onShowAdditionalMetadataChange: (show: boolean) => void;
    onExportTypeChange: (type: ExportType) => void;
    onReportStructureChange: (reports: ReportStructure[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onDecoupledEntriesChange: (value: boolean) => void;
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showMatrix2dOptions: boolean;
}

const exportTypes: ExportTypeItem[] = [
    {
        key: 'word',
        img: wordIcon,
        title: _ts('export', 'docxLabel'),
    },
    {
        key: 'pdf',
        img: pdfIcon,
        title: _ts('export', 'pdfLabel'),
    },
    {
        key: 'excel',
        title: _ts('export', 'xlsxLabel'),
        img: excelIcon,
    },
    {
        key: 'json',
        img: jsonIcon,
        title: _ts('export', 'jsonLabel'),
    },
];

const exportTypeKeyExtractor = (d: ExportTypeItem) => d.key;

interface RenderWordProps {
    entryFilterOptions: {
        projectEntryLabel: [];
    };
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showMatrix2dOptions: boolean;
    onReportStructureChange: (reports: ReportStructure[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onShowGroupsChange: (show: boolean) => void;
    onShowEntryIdChange: (show: boolean) => void;
    onShowAryDetailsChange: (show: boolean) => void;
    onShowAdditionalMetadataChange: (show: boolean) => void;
    reportStructure?: ReportStructure[];
    reportStructureVariant: string;
    showGroups: boolean;
    showEntryId: boolean;
    showAryDetails: boolean;
    showAdditionalMetadata: boolean;
}

function RenderWordPdfOptions(props: RenderWordProps) {
    const {
        entryFilterOptions,
        onReportStructureChange,
        onReportStructureVariantChange,
        onShowGroupsChange,
        onShowEntryIdChange,
        onShowAryDetailsChange,
        onShowAdditionalMetadataChange,
        reportStructure,
        reportStructureVariant,
        showGroups,
        showEntryId,
        showAryDetails,
        showAdditionalMetadata,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
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

    const showEntryGroupsSelection =
        entryFilterOptions?.projectEntryLabel &&
        entryFilterOptions?.projectEntryLabel.length > 0;

    return (
        <>
            <div className={styles.reportStructure}>
                <h4 className={styles.heading}>
                    { _ts('export', 'reportStructureLabel')}
                </h4>
                <div className={styles.bottomContainer}>
                    <TreeSelection
                        showLabel={false}
                        value={reportStructure}
                        onChange={onReportStructureChange}
                    />
                    {showMatrix2dOptions && (
                        <div>
                            <Checkbox
                                className={styles.includeSubSector}
                                key="checkbox"
                                label={_ts('export', 'includeSubSector')}
                                value={includeSubSector}
                                onChange={onIncludeSubSectorChange}
                            />
                            <Checkbox
                                className={styles.includeSubSector}
                                key="swap-checkbox"
                                label={_ts('export', 'swapColumnRowsLabel')}
                                value={swapOrderValue}
                                onChange={handleSwapOrderValueChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.contentSettings}>
                <h4 className={styles.heading}>
                    { _ts('export', 'contentSettingsText')}
                </h4>
                {showEntryGroupsSelection && (
                    <Checkbox
                        label={_ts('export', 'showEntryGroupsLabel')}
                        value={showGroups}
                        className={styles.showGroupCheckbox}
                        onChange={onShowGroupsChange}
                    />
                )}
                <Checkbox
                    label={_ts('export', 'showEntryIdLabel')}
                    value={showEntryId}
                    className={styles.showEntryIdCheckbox}
                    onChange={onShowEntryIdChange}
                />
                <Checkbox
                    label={_ts('export', 'showAryDetailLabel')}
                    value={showAryDetails}
                    className={styles.showAryDetailsCheckbox}
                    onChange={onShowAryDetailsChange}
                />
                <Checkbox
                    label={_ts('export', 'showAdditionalMetadataLabel')}
                    value={showAdditionalMetadata}
                    onChange={onShowAdditionalMetadataChange}
                />
            </div>
        </>
    );
}

interface RenderExcelProps {
    decoupledEntries: boolean;
    onDecoupledEntriesChange: (value: boolean) => void;
}

function RenderExcelOptions(props: RenderExcelProps) {
    const {
        decoupledEntries,
        onDecoupledEntriesChange,
    } = props;

    return (
        <>
            <Checkbox
                key="checkbox"
                label={_ts('export', 'decoupledEntriesLabel')}
                value={decoupledEntries}
                onChange={onDecoupledEntriesChange}
            />
            <div
                key="info"
            >
                <Icon
                    name="info"
                />
                <div>
                    <p>{_ts('export', 'decoupledEntriesTitle2')}</p>
                    <p>{_ts('export', 'decoupledEntriesTitle')}</p>
                </div>
            </div>
        </>
    );
}

function RenderOptions(props: Omit<Props, 'onExportTypeChange'>) {
    const {
        activeExportTypeKey,
        reportStructure,
        reportStructureVariant,
        onReportStructureChange,
        onReportStructureVariantChange,
        showGroups,
        showEntryId,
        showAryDetails,
        showAdditionalMetadata,
        onShowGroupsChange,
        onShowEntryIdChange,
        onShowAryDetailsChange,
        onShowAdditionalMetadataChange,
        decoupledEntries,
        onDecoupledEntriesChange,
        entryFilterOptions,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
    } = props;

    switch (activeExportTypeKey) {
        case 'word':
        case 'pdf':
            return (
                <RenderWordPdfOptions
                    entryFilterOptions={entryFilterOptions}
                    includeSubSector={includeSubSector}
                    onIncludeSubSectorChange={onIncludeSubSectorChange}
                    onReportStructureChange={onReportStructureChange}
                    onReportStructureVariantChange={onReportStructureVariantChange}
                    onShowGroupsChange={onShowGroupsChange}
                    onShowEntryIdChange={onShowEntryIdChange}
                    onShowAryDetailsChange={onShowAryDetailsChange}
                    onShowAdditionalMetadataChange={onShowAdditionalMetadataChange}
                    showMatrix2dOptions={showMatrix2dOptions}
                    reportStructure={reportStructure}
                    reportStructureVariant={reportStructureVariant}
                    showGroups={showGroups}
                    showEntryId={showEntryId}
                    showAryDetails={showAryDetails}
                    showAdditionalMetadata={showAdditionalMetadata}
                />
            );
        case 'excel':
            return (
                <RenderExcelOptions
                    decoupledEntries={decoupledEntries}
                    onDecoupledEntriesChange={onDecoupledEntriesChange}
                />
            );
        default:
            return (
                <p>
                    { _ts('export', 'noOptionsAvailable') }
                </p>
            );
    }
}

function ExportTypePane(props: Props) {
    const {
        onExportTypeChange,
        activeExportTypeKey,
        reportStructure,
        reportStructureVariant,
        onReportStructureChange,
        onReportStructureVariantChange,
        showGroups,
        showEntryId,
        showAryDetails,
        showAdditionalMetadata,
        onShowGroupsChange,
        onShowEntryIdChange,
        onShowAryDetailsChange,
        onShowAdditionalMetadataChange,
        decoupledEntries,
        onDecoupledEntriesChange,
        entryFilterOptions,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
    } = props;

    const exportTypeRendererParams = useCallback((key: ExportType, data: ExportTypeItem) => {
        const {
            title,
            img,
        } = data;

        return ({
            buttonKey: key,
            className: styles.exportTypeSelect,
            title,
            img,
            isActive: activeExportTypeKey === key,
            onExportTypeChange,
        });
    }, [activeExportTypeKey, onExportTypeChange]);

    return (
        <section className={styles.exportTypes}>
            <div className={styles.exportTypeContainer}>
                <h4>
                    {_ts('export', 'fileFormatSelectionLabel')}
                </h4>
                <ListView
                    className={styles.exportTypeSelectList}
                    data={exportTypes}
                    rendererParams={exportTypeRendererParams}
                    renderer={ExportTypePaneButton}
                    keySelector={exportTypeKeyExtractor}
                />
            </div>
            <RenderOptions
                activeExportTypeKey={activeExportTypeKey}
                entryFilterOptions={entryFilterOptions}
                reportStructure={reportStructure}
                reportStructureVariant={reportStructureVariant}
                onReportStructureChange={onReportStructureChange}
                onReportStructureVariantChange={onReportStructureVariantChange}
                showGroups={showGroups}
                showEntryId={showEntryId}
                showAryDetails={showAryDetails}
                showAdditionalMetadata={showAdditionalMetadata}
                onShowGroupsChange={onShowGroupsChange}
                onShowEntryIdChange={onShowEntryIdChange}
                onShowAryDetailsChange={onShowAryDetailsChange}
                onShowAdditionalMetadataChange={onShowAdditionalMetadataChange}
                decoupledEntries={decoupledEntries}
                onDecoupledEntriesChange={onDecoupledEntriesChange}
                includeSubSector={includeSubSector}
                onIncludeSubSectorChange={onIncludeSubSectorChange}
                showMatrix2dOptions={showMatrix2dOptions}
            />
        </section>
    );
}

export default ExportTypePane;
