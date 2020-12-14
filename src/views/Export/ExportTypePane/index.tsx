import React, { useCallback, useMemo } from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import SegmentInput from '#rsci/SegmentInput';
import List from '#rscv/List';

import {
    ExportType,
    ReportStructureVariant,
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
    contextualWidgets: TreeSelectableWidget[];
    textWidgets: TreeSelectableWidget[];
    entryFilterOptions?: {
        projectEntryLabel: [];
    };
    activeExportTypeKey: ExportType;
    reportStructureVariant: string;
    decoupledEntries: boolean;
    showGroups: boolean;
    onShowGroupsChange: boolean;
    onExportTypeChange: (type: ExportType) => void;
    onReportStructureChange: (reports: ReportStructure[]) => void;
    onContextualWidgetsChange: (widgets: TreeSelectableWidget[]) => void;
    onTextWidgetsChange: (widgets: TreeSelectableWidget[]) => void;
    onReportStructureVariantChange: (variant: ReportStructureVariant) => void;
    onDecoupledEntriesChange: (value: boolean) => void;
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

const exportTypeKeyExtractor = (d: ExportTypeItem) => d.key;
const reportVariantKeySelector = (d: ReportStructureOption) => d.key;
const reportVariantLabelSelector = (d: ReportStructureOption) => d.label;

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
    } = props;

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

    const renderWordPdfOptions = useMemo(() => {
        if (!reportStructure) {
            return (
                <p>
                    { _ts('export', 'noMatrixAfText')}
                </p>
            );
        }

        const showTextWidgetSelection = textWidgets.length > 0;
        const showEntryGroupsSelection =
            entryFilterOptions?.projectEntryLabel &&
            entryFilterOptions?.projectEntryLabel.length > 0;
        const showContextualWidgetSelection = contextualWidgets.length > 0;
        const showContentSettings =
            showTextWidgetSelection
            || showEntryGroupsSelection
            || showContextualWidgetSelection;

        return (
            <div className={styles.reportOptions}>
                <div>
                    <h4 className={styles.heading}>
                        { _ts('export', 'reportStructureLabel')}
                    </h4>
                    <SegmentInput
                        label={_ts('export', 'orderMatrix2D')}
                        keySelector={reportVariantKeySelector}
                        labelSelector={reportVariantLabelSelector}
                        value={reportStructureVariant}
                        onChange={onReportStructureVariantChange}
                        options={reportStructureOptions}
                    />
                    <TreeSelection
                        label={_ts('export', 'structureLabel')}
                        value={reportStructure}
                        onChange={onReportStructureChange}
                    />
                </div>
                {showContentSettings && (
                    <div className={styles.contentSettings}>
                        <h4 className={styles.heading}>
                            { _ts('export', 'contentSettingsText')}
                        </h4>
                        <div>
                            {showEntryGroupsSelection && (
                                <Checkbox
                                    label={_ts('export', 'showEntryGroupsLabel')}
                                    value={showGroups}
                                    className={styles.showGroupCheckbox}
                                    onChange={onShowGroupsChange}
                                />
                            )}
                            {showTextWidgetSelection && (
                                <TreeSelection
                                    label={_ts('export', 'textWidgetLabel')}
                                    value={textWidgets}
                                    onChange={onTextWidgetsChange}
                                />
                            )}
                            {showContextualWidgetSelection && (
                                <TreeSelection
                                    label={_ts('export', 'contextualWidgetLabel')}
                                    value={contextualWidgets}
                                    onChange={onContextualWidgetsChange}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }, [
        contextualWidgets,
        entryFilterOptions,
        onContextualWidgetsChange,
        onReportStructureChange,
        onReportStructureVariantChange,
        onShowGroupsChange,
        onTextWidgetsChange,
        reportStructure,
        reportStructureVariant,
        showGroups,
        textWidgets,
    ]);

    const renderExcelOptions = useMemo(() => (
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
    ), [decoupledEntries, onDecoupledEntriesChange]);

    const renderOptions = useMemo(() => {
        switch (activeExportTypeKey) {
            case 'word':
            case 'pdf':
                return renderWordPdfOptions;
            case 'excel':
                return renderExcelOptions;
            default:
                return (
                    <p>
                        { _ts('export', 'noOptionsAvailable') }
                    </p>
                );
        }
    }, [renderWordPdfOptions, renderExcelOptions, activeExportTypeKey]);

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
            <div className={styles.exportTypeOptions}>
                { renderOptions }
            </div>
        </section>
    );
}

export default ExportTypePane;
