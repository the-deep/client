import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

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

import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    onExportTypeChange: PropTypes.func.isRequired,
    onReportStructureChange: PropTypes.func.isRequired,
    onDecoupledEntriesChange: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    reportStructure: undefined,
};

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

    static mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && ExportTypePane.mapReportLevelsToNodes(level.sublevels),
    }));

    static transformMatrix2dLevels = (levels) => {
        const sectorsLevels = levels.map(
            d => ({
                id: d.id,
                title: d.title,
            }),
        );
        const dimensions = levels[0].sublevels;

        const newStructure = dimensions.map((l) => {
            const newStructureLevel = l.sublevels.map(sl => ({
                ...sl,
                sublevels: sectorsLevels,
            }));

            return ({
                ...l,
                sublevels: newStructureLevel,
            });
        });

        return newStructure;
    }

    constructor(props) {
        super(props);

        this.state = {
            reportStructureVariant: SECTOR_FIRST,
        };

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

    componentDidMount() {
        const {
            analysisFramework,
            onReportStructureChange,
        } = this.props;

        const { reportStructureVariant } = this.state;

        const newReportStructure = this.createReportStructure(
            analysisFramework,
            reportStructureVariant,
        );

        onReportStructureChange(newReportStructure);
    }

    componentWillReceiveProps(nextProps) {
        const {
            analysisFramework,
            onReportStructureChange,
        } = this.props;

        const { reportStructureVariant } = this.state;

        if (analysisFramework !== nextProps.analysisFramework) {
            const newReportStructure = this.createReportStructure(
                analysisFramework,
                reportStructureVariant,
            );

            onReportStructureChange(newReportStructure);
        }
    }

    createReportStructure = memoize((analysisFramework, reportStructureVariant) => {
        if (!analysisFramework) {
            return undefined;
        }

        const { exportables, widgets } = analysisFramework;
        const nodes = [];

        if (!exportables || !widgets) {
            return undefined;
        }

        exportables.forEach((exportable) => {
            const levels = exportable.data && exportable.data.report &&
                exportable.data.report.levels;
            const widget = widgets.find(w => w.key === exportable.widgetKey);

            if (!levels || !widget) {
                return;
            }

            if (widget.widgetId === 'matrix2dWidget' && reportStructureVariant === DIMENSION_FIRST) {
                const newLevels = ExportTypePane.transformMatrix2dLevels(levels);
                nodes.push({
                    title: widget.title,
                    key: `${exportable.id}`,
                    selected: true,
                    draggable: true,
                    nodes: ExportTypePane.mapReportLevelsToNodes(newLevels),
                });
            } else {
                nodes.push({
                    title: widget.title,
                    key: `${exportable.id}`,
                    selected: true,
                    draggable: true,
                    nodes: ExportTypePane.mapReportLevelsToNodes(levels),
                });
            }
        });

        nodes.push({
            title: _ts('export', 'uncategorizedTitle'),
            key: 'uncategorized',
            selected: true,
            draggable: true,
        });

        return nodes;
    })

    handleReportStructureChange = (reportStructureVariant) => {
        const {
            analysisFramework,
            onReportStructureChange,
        } = this.props;

        this.setState({ reportStructureVariant }, () => {
            const newReportStructure = this.createReportStructure(
                analysisFramework,
                reportStructureVariant,
            );

            onReportStructureChange(newReportStructure);
        });
    }

    renderExportType = (key, data) => {
        const {
            onExportTypeChange,
            activeExportTypeKey,
        } = this.props;

        return (
            <button
                className={_cs(
                    styles.exportTypeSelect,
                    activeExportTypeKey === key && styles.active,
                )}
                key={key}
                title={data.title}
                onClick={() => onExportTypeChange(key)}
                type="button"
            >
                <img
                    className={styles.image}
                    src={data.img}
                    alt={data.title}
                />
            </button>
        );
    }

    renderWordPdfOptions = () => {
        const {
            reportStructure,
            onReportStructureChange,
        } = this.props;

        const { reportStructureVariant } = this.state;

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
                    onChange={this.handleReportStructureChange}
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
                        modifier={this.renderExportType}
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
