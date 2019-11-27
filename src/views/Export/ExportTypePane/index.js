import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import Checkbox from '#rsci/Checkbox';
import TreeSelection from '#rsci/TreeSelection';
import SegmentInput from '#rsci/SegmentInput';
import List from '#rscv/List';

import _ts from '#ts';

import wordIcon from '#resources/img/word.svg';
import excelIcon from '#resources/img/excel.svg';
import pdfIcon from '#resources/img/pdf.svg';
import jsonIcon from '#resources/img/json.svg';

import ExportTypePaneButton from './ExportTypeButton';

import styles from './styles.scss';

const propTypes = {
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    reportStructureVariant: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    onExportTypeChange: PropTypes.func.isRequired,
    onReportStructureChange: PropTypes.func.isRequired,
    onReportStructureVariantChange: PropTypes.func.isRequired,
    onDecoupledEntriesChange: PropTypes.func.isRequired,
};

const defaultProps = { reportStructure: undefined };


const SECTOR_FIRST = 'sectorFirst';
const DIMENSION_FIRST = 'dimensionFirst';

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

    static mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && ExportTypePane.mapReportLevelsToNodes(level.sublevels),
    }));


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
            onReportStructureVariantChange,
        } = this.props;

        if (!reportStructure) {
            return (
                <p>
                    { _ts('export', 'noMatrixAfText')}
                </p>
            );
        }

        return (
            <>
                <h4 key="header">
                    {_ts('export', 'reportStructureLabel')}
                </h4>
                <SegmentInput
                    keySelector={ExportTypePane.reportVariantKeySelector}
                    labelSelector={ExportTypePane.reportVariantLabelSelector}
                    value={reportStructureVariant}
                    onChange={onReportStructureVariantChange}
                    options={reportStructureOptions}
                />
                <TreeSelection
                    key="tree-selection"
                    value={reportStructure}
                    onChange={onReportStructureChange}
                />
            </>
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
