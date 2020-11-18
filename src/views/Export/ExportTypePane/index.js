import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import SegmentInput from '#rsci/SegmentInput';
import List from '#rscv/List';

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

const propTypes = {
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    contextualWidgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    textWidgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entryFilterOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    reportStructureVariant: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    showGroups: PropTypes.bool.isRequired,
    onShowGroupsChange: PropTypes.bool.isRequired,
    onExportTypeChange: PropTypes.func.isRequired,
    onReportStructureChange: PropTypes.func.isRequired,
    onContextualWidgetsChange: PropTypes.func.isRequired,
    onTextWidgetsChange: PropTypes.func.isRequired,
    onReportStructureVariantChange: PropTypes.func.isRequired,
    onDecoupledEntriesChange: PropTypes.func.isRequired,
};

const defaultProps = {
    reportStructure: undefined,
    contextualWidgets: [],
    textWidgets: [],
    entryFilterOptions: {},
};


const reportStructureOptions = [
    {
        key: SECTOR_FIRST,
        label: _ts('export', 'sectorFirstExportTypeLabel'),
    },
    {
        key: DIMENSION_FIRST,
        label: _ts('export', 'dimensionFirstExportTypeLabel'),
    },
];


export default class ExportTypePane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportTypeKeyExtractor = d => d.key;
    static reportVariantKeySelector = d => d.key;
    static reportVariantLabelSelector = d => d.label;

    static reportVariantLabelSelector = d => d.label;

    constructor(props) {
        super(props);

        this.exportTypes = [
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
    }

    exportTypeRendererParams = (key, data) => {
        const {
            onExportTypeChange,
            activeExportTypeKey,
        } = this.props;

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
    };

    renderWordPdfOptions = () => {
        const {
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
            entryFilterOptions: {
                projectEntryLabel,
            },
        } = this.props;

        if (!reportStructure) {
            return (
                <p>
                    { _ts('export', 'noMatrixAfText')}
                </p>
            );
        }

        const showTextWidgetSelection = textWidgets.length > 0;
        const showEntryGroupsSelection = projectEntryLabel && projectEntryLabel.length > 0;
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
                        keySelector={ExportTypePane.reportVariantKeySelector}
                        labelSelector={ExportTypePane.reportVariantLabelSelector}
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
    }

    renderExcelOptions = () => {
        const {
            decoupledEntries,
            onDecoupledEntriesChange,
        } = this.props;

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

    renderOptions = (activeExportTypeKey) => {
        switch (activeExportTypeKey) {
            case 'word':
            case 'pdf':
                return this.renderWordPdfOptions();
            case 'excel':
                return this.renderExcelOptions();
            default:
                return (
                    <p>
                        { _ts('export', 'noOptionsAvailable') }
                    </p>
                );
        }
    }

    render() {
        const { activeExportTypeKey } = this.props;

        return (
            <section className={styles.exportTypes}>
                <div className={styles.exportTypeSelectList}>
                    <List
                        className={styles.exportTypeSelectList}
                        data={this.exportTypes}
                        rendererParams={this.exportTypeRendererParams}
                        renderer={ExportTypePaneButton}
                        keySelector={ExportTypePane.exportTypeKeyExtractor}
                    />
                </div>
                <div className={styles.exportTypeOptions}>
                    { this.renderOptions(activeExportTypeKey) }
                </div>
            </section>
        );
    }
}
