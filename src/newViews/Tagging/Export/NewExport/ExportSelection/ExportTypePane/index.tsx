import React, { useMemo, useCallback } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
    Checkbox,
    List,
    ExpandableContainer,
    Container,
} from '@the-deep/deep-ui';

import {
    EntryOptions,
    ExportType,
    ReportStructure,
    TreeSelectableWidget,
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

import TreeSelection from '#rsci/TreeSelection';

import ExportTypePaneButton from './ExportTypeButton';

import styles from './styles.scss';

interface ExportTypeItem {
    key: ExportType;
    img: string;
    title: string;
}

interface Props {
    reportStructure?: ReportStructure[];
    entryFilterOptions?: EntryOptions;
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
    contextualWidgets: TreeSelectableWidget<string | number>[];
    onSetContextualWidgets: (value: TreeSelectableWidget<string | number>[]) => void;
    textWidgets: TreeSelectableWidget<string | number>[];
    onSetTextWidgets: (value: TreeSelectableWidget<string | number>[]) => void;
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
    entryFilterOptions?: EntryOptions;
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
    contextualWidgets: TreeSelectableWidget<string | number>[];
    onSetContextualWidgets: (value: TreeSelectableWidget<string | number>[]) => void;
    textWidgets: TreeSelectableWidget<string | number>[];
    onSetTextWidgets: (value: TreeSelectableWidget<string | number>[]) => void;
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

    const showEntryGroupsSelection =
        entryFilterOptions?.projectEntryLabel &&
        entryFilterOptions?.projectEntryLabel.length > 0;

    return (
        <>
            <Container
                className={styles.contentSettings}
                headingSize="extraSmall"
                heading={_ts('export', 'contentSettingsText')}
                sub
            >
                {showEntryGroupsSelection && (
                    <Checkbox
                        name="showGroups"
                        label={_ts('export', 'showEntryGroupsLabel')}
                        value={showGroups}
                        onChange={onShowGroupsChange}
                        className={styles.checkbox}
                    />
                )}
                <Checkbox
                    name="showEntryId"
                    label={_ts('export', 'showEntryIdLabel')}
                    value={showEntryId}
                    onChange={onShowEntryIdChange}
                    className={styles.checkbox}
                />
                <Checkbox
                    name="showAryDetails"
                    label={_ts('export', 'showAryDetailLabel')}
                    value={showAryDetails}
                    onChange={onShowAryDetailsChange}
                    className={styles.checkbox}
                />
                <Checkbox
                    name="showAdditionalMetaData"
                    label={_ts('export', 'showAdditionalMetadataLabel')}
                    value={showAdditionalMetadata}
                    onChange={onShowAdditionalMetadataChange}
                    className={styles.checkbox}
                />
            </Container>
            <Container
                className={styles.reportStructure}
                headingSize="extraSmall"
                heading={_ts('export', 'reportStructureLabel')}
                sub
                contentClassName={styles.content}
            >
                <TreeSelection
                    showLabel={false}
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
                className={styles.reportStructure}
                headingSize="extraSmall"
                heading="Additional Metadata"
                sub
                contentClassName={styles.content}
            >
                {contextualWidgets.length > 0 && showAdditionalMetadata && (
                    <TreeSelection
                        label="Contextual widgets"
                        value={contextualWidgets}
                        onChange={onSetContextualWidgets}
                        direction="horizontal"
                    />
                )}
                {textWidgets.length > 0 && (
                    <TreeSelection
                        label="Free text widgets"
                        value={textWidgets}
                        onChange={onSetTextWidgets}
                        direction="horizontal"
                    />
                )}
            </Container>
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
                name="decoupledEntries"
                label={_ts('export', 'decoupledEntriesLabel')}
                value={decoupledEntries}
                onChange={onDecoupledEntriesChange}
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
        contextualWidgets,
        onSetContextualWidgets,
        textWidgets,
        onSetTextWidgets,
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
                    contextualWidgets={contextualWidgets}
                    onSetContextualWidgets={onSetContextualWidgets}
                    textWidgets={textWidgets}
                    onSetTextWidgets={onSetTextWidgets}
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
        contextualWidgets,
        onSetContextualWidgets,
        textWidgets,
        onSetTextWidgets,
    } = props;

    const exportTypeRendererParams = useCallback((key: ExportType, data: ExportTypeItem) => {
        const {
            title,
            img,
        } = data;

        return ({
            buttonKey: key,
            className: styles.exportType,
            title,
            img,
            isActive: activeExportTypeKey === key,
            onExportTypeChange,
        });
    }, [activeExportTypeKey, onExportTypeChange]);

    return (
        <section className={styles.exportTypePane}>
            <Container
                className={styles.exportTypesContainer}
                headingSize="extraSmall"
                heading={_ts('export', 'fileFormatSelectionLabel')}
                sub
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
                sub
                heading="Advanced"
                defaultVisibility
            >
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
                    contextualWidgets={contextualWidgets}
                    onSetContextualWidgets={onSetContextualWidgets}
                    textWidgets={textWidgets}
                    onSetTextWidgets={onSetTextWidgets}
                />
            </ExpandableContainer>
        </section>
    );
}

export default ExportTypePane;
