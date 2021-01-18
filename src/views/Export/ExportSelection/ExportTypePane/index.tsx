import React, { useCallback } from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import SegmentInput from '#rsci/SegmentInput';
import List from '#rscv/List';

import {
    ExportType,
    ReportStructure,
} from '#typings';

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

interface ReportStructureOption {
    key: string;
    label: string;

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
    onShowGroupsChange: (show: boolean) => void;
    onExportTypeChange: (type: ExportType) => void;
    onReportStructureChange: (reports: ReportStructure[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    onDecoupledEntriesChange: (value: boolean) => void;
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showMatrix2dOptions: boolean;
}

const reportStructureOptions: ReportStructureOption[] = [
    {
        key: SECTOR_FIRST,
        label: _ts('export', 'sectorFirstExportTypeLabel'),
    },
    {
        key: DIMENSION_FIRST,
        label: _ts('export', 'dimensionFirstExportTypeLabel'),
    },
];

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
const reportVariantKeySelector = (d: ReportStructureOption) => d.key;
const reportVariantLabelSelector = (d: ReportStructureOption) => d.label;

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
    reportStructure?: ReportStructure[];
    reportStructureVariant: string;
    showGroups: boolean;
}

function RenderWordPdfOptions(props: RenderWordProps) {
    const {
        entryFilterOptions,
        onReportStructureChange,
        onReportStructureVariantChange,
        onShowGroupsChange,
        reportStructure,
        reportStructureVariant,
        showGroups,
        includeSubSector,
        onIncludeSubSectorChange,
        showMatrix2dOptions,
    } = props;

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
                {showMatrix2dOptions && (
                    <div className={styles.leftContainer}>
                        <h4 className={styles.heading}>
                            { _ts('export', 'reportStructureLabel')}
                        </h4>
                        <Checkbox
                            className={styles.includeSubSector}
                            key="checkbox"
                            label={_ts('export', 'includeSubSector')}
                            value={includeSubSector}
                            onChange={onIncludeSubSectorChange}
                        />
                        <SegmentInput
                            label={_ts('export', 'orderMatrix2D')}
                            keySelector={reportVariantKeySelector}
                            labelSelector={reportVariantLabelSelector}
                            value={reportStructureVariant}
                            onChange={onReportStructureVariantChange}
                            options={reportStructureOptions}
                        />
                    </div>
                )}
                <div className={styles.right}>
                    {!showMatrix2dOptions && (
                        <h4 className={styles.heading}>
                            { _ts('export', 'reportStructureLabel')}
                        </h4>
                    )}
                    <TreeSelection
                        label={_ts('export', 'structureLabel')}
                        value={reportStructure}
                        onChange={onReportStructureChange}
                    />
                </div>
            </div>
            {showEntryGroupsSelection && (
                <div className={styles.contentSettings}>
                    <h4 className={styles.heading}>
                        { _ts('export', 'contentSettingsText')}
                    </h4>
                    <Checkbox
                        label={_ts('export', 'showEntryGroupsLabel')}
                        value={showGroups}
                        className={styles.showGroupCheckbox}
                        onChange={onShowGroupsChange}
                    />
                </div>
            )}
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
                className={styles.info}
            >
                <Icon
                    className={styles.icon}
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
        onShowGroupsChange,
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
                    showMatrix2dOptions={showMatrix2dOptions}
                    reportStructure={reportStructure}
                    reportStructureVariant={reportStructureVariant}
                    showGroups={showGroups}
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
        onShowGroupsChange,
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
            <div className={styles.exportTypeSelectList}>
                <List
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
                onShowGroupsChange={onShowGroupsChange}
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
