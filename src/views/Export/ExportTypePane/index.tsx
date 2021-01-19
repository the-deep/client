import React, { useCallback } from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import SegmentInput from '#rsci/SegmentInput';
import List from '#rscv/List';

import {
    ExportType,
    TreeSelectableWidget,
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
    showRowColumnSelection: boolean;
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
    reportStructure?: ReportStructure[];
    contextualWidgets: TreeSelectableWidget<string | number>[];
    textWidgets: TreeSelectableWidget<string | number>[];
    entryFilterOptions: {
        projectEntryLabel: [];
    };
    reportStructureVariant: string;
    showGroups: boolean;
    onShowGroupsChange: (show: boolean) => void;
    onReportStructureChange: (reports: ReportStructure[]) => void;
    onContextualWidgetsChange: (widgets: TreeSelectableWidget<string | number>[]) => void;
    onTextWidgetsChange: (widgets: TreeSelectableWidget<string | number>[]) => void;
    onReportStructureVariantChange: (variant: string) => void;
    includeSubSector: boolean;
    onIncludeSubSectorChange: (value: boolean) => void;
    showRowColumnSelection: boolean;
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
        showRowColumnSelection,
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
                    {console.warn('row column', showRowColumnSelection)}
                    {showRowColumnSelection &&
                        <SegmentInput
                            label={_ts('export', 'orderMatrix2D')}
                            keySelector={reportVariantKeySelector}
                            labelSelector={reportVariantLabelSelector}
                            value={reportStructureVariant}
                            onChange={onReportStructureVariantChange}
                            options={reportStructureOptions}
                        />
                    }
                </div>
                <TreeSelection
                    className={styles.right}
                    label={_ts('export', 'structureLabel')}
                    value={reportStructure}
                    onChange={onReportStructureChange}
                />
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
        onContextualWidgetsChange,
        onTextWidgetsChange,
        onReportStructureVariantChange,
        contextualWidgets,
        textWidgets,
        showGroups,
        onShowGroupsChange,
        decoupledEntries,
        onDecoupledEntriesChange,
        entryFilterOptions,
        includeSubSector,
        onIncludeSubSectorChange,
        showRowColumnSelection,
    } = props;

    switch (activeExportTypeKey) {
        case 'word':
        case 'pdf':
            return (
                <RenderWordPdfOptions
                    entryFilterOptions={entryFilterOptions}
                    reportStructure={reportStructure}
                    reportStructureVariant={reportStructureVariant}
                    onReportStructureChange={onReportStructureChange}
                    onContextualWidgetsChange={onContextualWidgetsChange}
                    onTextWidgetsChange={onTextWidgetsChange}
                    onReportStructureVariantChange={onReportStructureVariantChange}
                    contextualWidgets={contextualWidgets}
                    textWidgets={textWidgets}
                    showGroups={showGroups}
                    onShowGroupsChange={onShowGroupsChange}
                    includeSubSector={includeSubSector}
                    onIncludeSubSectorChange={onIncludeSubSectorChange}
                    showRowColumnSelection={showRowColumnSelection}
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
        onContextualWidgetsChange,
        onTextWidgetsChange,
        onReportStructureVariantChange,
        contextualWidgets,
        textWidgets,
        showGroups,
        onShowGroupsChange,
        decoupledEntries,
        onDecoupledEntriesChange,
        entryFilterOptions,
        includeSubSector,
        onIncludeSubSectorChange,
        showRowColumnSelection,
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
                onContextualWidgetsChange={onContextualWidgetsChange}
                onTextWidgetsChange={onTextWidgetsChange}
                onReportStructureVariantChange={onReportStructureVariantChange}
                contextualWidgets={contextualWidgets}
                textWidgets={textWidgets}
                showGroups={showGroups}
                onShowGroupsChange={onShowGroupsChange}
                decoupledEntries={decoupledEntries}
                onDecoupledEntriesChange={onDecoupledEntriesChange}
                includeSubSector={includeSubSector}
                onIncludeSubSectorChange={onIncludeSubSectorChange}
                showRowColumnSelection={showRowColumnSelection}
            />
        </section>
    );
}

export default ExportTypePane;
