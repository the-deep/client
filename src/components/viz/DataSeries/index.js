import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import MultiViewContainer from '#rscv/MultiViewContainer';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import Button from '#rsca/Button';
import GeoViz from '#components/geo/GeoViz';
import RotatingInput from '#rsci/RotatingInput';
import SimpleHorizontalBarChart from '#rscz/SimpleHorizontalBarChart';
import SimpleVerticalBarChart from '#rscz/SimpleVerticalBarChart';
import WordCloud from '#rscz/WordCloud';
import { iconNames } from '#constants';
import modalize from '#rscg/Modalize';

import _cs from '#cs';
import _ts from '#ts';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        fieldId: PropTypes.number,
        title: PropTypes.string,
        type: PropTypes.string,
        series: PropTypes.array,
    }),
};

const defaultProps = {
    className: '',
    value: {
        title: '',
        type: 'string',
        series: [],
    },
};

const chartMargins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
};

const sizeSelector = d => d.size;
const chartsLabelSelector = d => d.text;
const horizontalBarTextSelector = () => '';
const tooltipSelector = d => `<span>${d.text}</span>`;
const rotatingInputKeySelector = d => d.key;
const rotatingInputLabelSelector = d => d.label;

const GRAPH = {
    horizontalBarChart: 'horizontal-bar-chart',
    verticalBarChart: 'vertical-bar-chart',
    wordCloud: 'world-cloud',
    geo: 'geo',
};

const GRAPH_MODES = {
    string: [GRAPH.horizontalBarChart, GRAPH.verticalBarChart, GRAPH.wordCloud],
    number: [GRAPH.horizontalBarChart, GRAPH.verticalBarChart],
    datetime: [GRAPH.horizontalBarChart, GRAPH.verticalBarChart],
    geo: [GRAPH.geo],
};


const GRAPH_LABELS = {
    [GRAPH.horizontalBarChart]: <span>{_ts('components.viz.dataSeries', 'horizontalBarChartLabel')}</span>,
    [GRAPH.verticalBarChart]: <span>{_ts('components.viz.dataSeries', 'verticalBarChartLabel')}</span>,
    [GRAPH.wordCloud]: <span>{_ts('components.viz.dataSeries', 'wordCloudLabel')}</span>,
    [GRAPH.geo]: <span>{_ts('components.viz.dataSeries', 'geoLabel')}</span>,
};


export default class DataSeries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const commonRendererParams = {
            valueSelector: sizeSelector,
            showTooltip: true,
            margins: chartMargins,
            tooltipSelector,
            labelSelector: chartsLabelSelector,
        };

        this.views = {
            [GRAPH.horizontalBarChart]: {
                component: SimpleHorizontalBarChart,
                rendererParams: () => {
                    const { value: { data } } = this.props;
                    return {
                        className: styles.horizontalBarChart,
                        data: this.getNumberCountSeries(data),
                        ...commonRendererParams,
                    };
                },
            },
            [GRAPH.verticalBarChart]: {
                component: SimpleVerticalBarChart,
                rendererParams: () => {
                    const { value: { data } } = this.props;

                    return {
                        className: styles.verticalBarChart,
                        data: this.getNumberCountSeries(data),
                        ...commonRendererParams,
                    };
                },
            },
            [GRAPH.geo]: {
                component: GeoViz,
                rendererParams: () => {
                    const { value: { geodata = {} } } = this.props;
                    const { regions } = geodata;

                    return {
                        className: styles.geoVisualization,
                        regions,
                        value: this.getGeoValue(geodata),
                    };
                },
            },
            [GRAPH.wordCloud]: {
                component: WordCloud,
                rendererParams: () => {
                    const { value: { data } } = this.props;

                    return {
                        className: styles.wordCloud,
                        data: this.getWordCountSeries(data),
                        fontSizeSelector: sizeSelector,
                    };
                },
            },
        };

        this.state = {
            activeView: GRAPH.verticalBarChart,
        };
    }

    getSegmentOptions = memoize(type => (
        GRAPH_MODES[type].map(
            mode => ({
                key: mode,
                label: GRAPH_LABELS[mode],
            }),
        )
    ))

    getWordCountSeries = memoize((series) => {
        const sanitizedSeries = series
            .filter(datum => !datum.empty && !datum.invalid);
        const tags = sanitizedSeries.reduce(
            (acc, { value }) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {},
        );

        return Object.keys(tags).map(word => ({
            text: word,
            size: tags[word] * 6,
        }));
    })

    getNumberCountSeries = memoize((series) => {
        const sanitizedSeries = series
            .filter(datum => !datum.empty && !datum.invalid);
        const tags = sanitizedSeries.reduce(
            (acc, { value }) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {},
        );
        return Object.keys(tags)
            .map(word => ({
                text: word,
                size: tags[word],
            }))
            .sort((a, b) => a.size - b.size);
    })

    getNumberSeries = memoize(series => series.map((item, index) => ({
        key: index,
        value: parseFloat(item.value),
    })))

    getGeoValue = memoize(geodata => geodata.data.map(d => String(d.selectedId)))

    handleSegmentStateChange = (value) => {
        this.setState({ activeView: value });
    }

    renderExpandedModal = ({
        closeModal,
        title,
        type,
        activeView,
    }) => (
        <Modal className={styles.expandedView}>
            <ModalHeader
                title={title}
                rightComponent={
                    <div className={styles.actionButtons}>
                        <RotatingInput
                            rendererSelector={rotatingInputLabelSelector}
                            keySelector={rotatingInputKeySelector}
                            value={activeView}
                            onChange={this.handleSegmentStateChange}
                            options={this.getSegmentOptions(type)}
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <Button
                            iconName={iconNames.close}
                            onClick={closeModal}
                            className={styles.closeExpandedViewButton}
                            transparent
                        />
                    </div>
                }
            />
            <ModalBody className={styles.body}>
                <MultiViewContainer
                    views={this.views}
                    active={activeView}
                />
            </ModalBody>
        </Modal>
    );


    render() {
        const {
            className,
            value,
        } = this.props;

        const { activeView } = this.state;
        const ExpandedModal = this.renderExpandedModal;

        const options = this.getSegmentOptions(value.type);

        return (
            <div className={_cs(className, 'data-series', styles.dataSeries)}>
                <header className={styles.header}>
                    <h5 className={styles.heading}>
                        {value.title}
                    </h5>
                    <div className={styles.actions}>
                        { options && options.length > 1 &&
                            <RotatingInput
                                rendererSelector={rotatingInputLabelSelector}
                                keySelector={rotatingInputKeySelector}
                                value={activeView}
                                onChange={this.handleSegmentStateChange}
                                options={options}
                                showLabel={false}
                                showHintAndError={false}
                            />
                        }
                        <ModalButton
                            iconName={iconNames.expand}
                            className={styles.expandButton}
                            transparent
                            modal={
                                <ExpandedModal
                                    title={value.title}
                                    type={value.type}
                                    activeView={activeView}
                                />
                            }
                        />
                    </div>
                </header>
                <div className={styles.content}>
                    <MultiViewContainer
                        views={this.views}
                        active={activeView}
                    />
                </div>
            </div>
        );
    }
}
