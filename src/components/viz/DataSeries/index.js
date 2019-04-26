import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    listToMap,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import Icon from '#rscg/Icon';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Modal from '#rscv/Modal';
import RotatingInput from '#rsci/RotatingInput';
import ModalBody from '#rscv/Modal/Body';
import Button from '#rsca/Button';
import SimpleHorizontalBarChart from '#rscz/SimpleHorizontalBarChart';
import SimpleVerticalBarChart from '#rscz/SimpleVerticalBarChart';
import Histogram from '#rscz/Histogram';
import WordCloud from '#rscz/WordCloud';
import modalize from '#rscg/Modalize';

import GeoViz from '#components/geo/GeoViz';
import TextOutput from '#components/general/TextOutput';
import _cs from '#cs';
import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        title: PropTypes.string,
        type: PropTypes.string,
        cache: PropTypes.object,
        options: PropTypes.object,
    }),
    hideDetails: PropTypes.bool,
};

const defaultProps = {
    className: '',
    value: {
        title: '',
        type: 'string',
        series: [],
    },
    hideDetails: false,
};

const chartMargins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
};

const chartMarginsLarge = {
    top: 12,
    right: 2,
    bottom: 36,
    left: 36,
};

const sortingLabels = [
    {
        renderer: (
            <div title={_ts('components.viz.dataSeries', 'descendingTitle')}>
                <Icon name="sortAmountDescending" />
            </div>
        ),
        key: 'sortingDes',
    },
    {
        renderer: (
            <div title={_ts('components.viz.dataSeries', 'ascendingTitle')}>
                <Icon name="sortAmountAscending" />
            </div>
        ),
        key: 'sortingAsc',
    },
    {
        renderer: (
            <div title={_ts('components.viz.dataSeries', 'alphabeticalDescendingTitle')}>
                <Icon name="sortAlphabeticalDescending" />
            </div>
        ),
        key: 'sortingAlphaDes',
    },
    {
        renderer: (
            <div title={_ts('components.viz.dataSeries', 'alphabeticalAscendingTitle')}>
                <Icon name="sortAlphabeticalAscending" />
            </div>
        ),
        key: 'sortingAlphaAsc',
    },
];

const frequencySelector = d => d.count;
const valueSelector = d => d.value;

const sortKeySelector = d => d.key;
const sortRendererSelector = d => d.renderer;

const tooltipSelector = d => `<span>${d.value}</span>`;

const GRAPH = {
    horizontalBarChart: 'horizontal-bar-chart',
    verticalBarChart: 'vertical-bar-chart',
    wordCloud: 'word-cloud',
    histogram: 'histogram',
    geo: 'geo',
};

const GRAPH_MODES = {
    string: [GRAPH.verticalBarChart, GRAPH.horizontalBarChart, GRAPH.wordCloud],
    datetime: [GRAPH.verticalBarChart, GRAPH.horizontalBarChart],
    number: [GRAPH.histogram],
    geo: [GRAPH.geo],
};

const GRAPH_DETAILS = {
    [GRAPH.horizontalBarChart]: {
        title: _ts('components.viz.dataSeries', 'horizontalBarChartLabel'),
        iconName: 'horizontalbarIcon',
    },
    [GRAPH.verticalBarChart]: {
        title: _ts('components.viz.dataSeries', 'verticalBarChartLabel'),
        iconName: 'verticalbarIcon',
    },
    [GRAPH.histogram]: {
        title: _ts('components.viz.dataSeries', 'histogramLabel'),
        iconName: 'histogram',
    },
    [GRAPH.wordCloud]: {
        title: _ts('components.viz.dataSeries', 'wordCloudLabel'),
        iconName: 'wordcloudIcon',
    },
    [GRAPH.geo]: {
        title: _ts('components.viz.dataSeries', 'geoLabel'),
        iconName: 'globe',
    },
};

const colorRange = [
    '#cce7e3',
    '#cce7e3',
];

const Tab = ({
    icon,
    onClick,
    isActive,
}) => (
    <button
        onClick={onClick}
        type="button"
        className={_cs(
            styles.tab,
            isActive && styles.activeTab,
        )}
    >
        <Icon
            className={styles.icon}
            name={icon}
        />
    </button>
);

Tab.propTypes = {
    icon: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
};

Tab.defaultProps = {
    icon: '',
};


export default class DataSeries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.views = this.createView({ showLegend: false });
        this.modalViews = this.createView({ showLegend: true });
    }

    getSegmentOptions = memoize(type => (
        listToMap(
            GRAPH_MODES[type],
            mode => mode,
            mode => GRAPH_DETAILS[mode],
        )
    ))

    getHistogramData = memoize((series) => {
        const newSeries = [];
        series.forEach((datum) => {
            const frequency = frequencySelector(datum);
            const value = valueSelector(datum);
            for (let i = 0; i <= frequency; i += 1) {
                newSeries.push(value);
            }
        });
        return newSeries;
    })

    getWordCloudData = memoize((series) => {
        const tokens = {};
        series.forEach((datum) => {
            const frequency = frequencySelector(datum);
            const labels = valueSelector(datum);
            if (isNotDefined(labels)) {
                return;
            }
            labels.split(/\s+/).forEach((label) => {
                if (isDefined(tokens[label])) {
                    tokens[label] += frequency;
                } else {
                    tokens[label] = frequency;
                }
            });
        });
        return Object.keys(tokens).map(key => ({
            count: tokens[key],
            value: key,
        }));
    });

    createView = ({ showLegend }) => ({
        [GRAPH.horizontalBarChart]: {
            component: SimpleHorizontalBarChart,
            rendererParams: () => {
                const {
                    value: {
                        cache: {
                            series = [],
                        } = {},
                    } = {},
                    entryState: {
                        activeSort,
                    } = {},
                } = this.props;
                const sortedData = this.sort(activeSort, series);

                return {
                    className: styles.horizontalBarChart,
                    margins: chartMargins,

                    data: sortedData,
                    valueSelector: frequencySelector,
                    labelSelector: valueSelector,
                    tooltipSelector,
                };
            },
            lazyMount: true,
        },
        [GRAPH.verticalBarChart]: {
            component: SimpleVerticalBarChart,
            rendererParams: () => {
                const {
                    value: {
                        cache: {
                            series = [],
                        } = {},
                    } = {},
                    entryState: {
                        activeSort,
                    } = {},
                } = this.props;

                const sortedData = this.sort(activeSort, series);

                return {
                    className: styles.verticalBarChart,
                    margins: chartMargins,

                    data: sortedData,
                    valueSelector: frequencySelector,
                    labelSelector: valueSelector,
                    tooltipSelector,
                };
            },
            lazyMount: true,
        },
        [GRAPH.histogram]: {
            component: Histogram,
            rendererParams: () => {
                const {
                    value: {
                        cache: {
                            series = [],
                        } = {},
                    } = {},
                } = this.props;
                return {
                    className: styles.horizontalBarChart,
                    margins: showLegend ? chartMarginsLarge : chartMargins,
                    showAxis: showLegend,
                    colorRange,
                    data: this.getHistogramData(series),
                };
            },
            lazyMount: true,
        },
        [GRAPH.wordCloud]: {
            component: WordCloud,
            rendererParams: () => {
                const {
                    value: {
                        cache: {
                            series = [],
                        } = {},
                    } = {},
                } = this.props;
                return {
                    className: styles.wordCloud,

                    data: this.getWordCloudData(series),
                    labelSelector: valueSelector,
                    frequencySelector,
                };
            },
            lazyMount: true,
        },
        [GRAPH.geo]: {
            component: GeoViz,
            rendererParams: () => {
                const {
                    value: {
                        options: {
                            regions,
                            adminLevel,
                        } = {},
                        cache: {
                            series = [],
                        } = {},
                    },
                } = this.props;
                return {
                    className: styles.geoVisualization,
                    regions,
                    adminLevel,
                    showLegend,
                    data: series,
                    valueSelector,
                    frequencySelector,
                };
            },
            lazyMount: true,
        },
    })

    handleSegmentStateChange = (view, e) => {
        const {
            onEntryStateChange,
            entryState,
        } = this.props;

        e.stopPropagation();

        onEntryStateChange({
            ...entryState,
            activeView: view,
        });
    }

    handleSortChange = (sort) => {
        const {
            onEntryStateChange,
            entryState,
        } = this.props;
        onEntryStateChange({
            ...entryState,
            activeSort: sort,
        });
    }

    sort = (activeSort = 'sortingDes', data) => {
        // FIXME: use compare functions from utils
        if (activeSort === 'sortingAsc') {
            return [...data].sort((a, b) => b.count - a.count);
        } else if (activeSort === 'sortingAlphaDes') {
            return [...data].sort((a, b) => String(a.value).localeCompare(String(b.value)));
        } else if (activeSort === 'sortingAlphaAsc') {
            return [...data].sort((a, b) => String(b.value).localeCompare(String(a.value)));
        }
        return data;
    }

    scrollTabRendererParams = (_, tab) => ({
        icon: tab.iconName,
    })

    renderExpandedModal = ({
        closeModal,
        title,
        type,
        activeView,
        activeSort,
        healthStats = {},
        showSort,
    }) => {
        const options = this.getSegmentOptions(type);
        const {
            total = 0,
            empty = 0,
            invalid = 0,
        } = healthStats;

        const valid = total - empty - invalid;

        return (
            <Modal className={styles.expandedView}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>
                        {title}
                    </h2>
                    <div className={styles.actionButtons}>
                        {showSort &&
                            <RotatingInput
                                rendererSelector={sortRendererSelector}
                                keySelector={sortKeySelector}
                                value={activeSort}
                                onChange={this.handleSortChange}
                                options={sortingLabels}
                                showLabel={false}
                                showHintAndError={false}
                            />
                        }
                        { options && Object.keys(options).length > 1 &&
                            <ScrollTabs
                                active={activeView}
                                className={styles.fixedTabs}
                                onClick={this.handleSegmentStateChange}
                                renderer={Tab}
                                rendererParams={this.scrollTabRendererParams}
                                tabs={options}
                            />
                        }
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    </div>
                </header>
                <ModalBody className={styles.body}>
                    <header className={styles.healthStats}>
                        <TextOutput
                            className={styles.text}
                            label={_ts('components.viz.dataSeries', 'totalLabel')}
                            value={total}
                            isNumericValue
                        />
                        <TextOutput
                            className={styles.text}
                            label={_ts('components.viz.dataSeries', 'validLabel')}
                            value={valid}
                            isNumericValue
                        />
                        <TextOutput
                            className={styles.text}
                            label={_ts('components.viz.dataSeries', 'inValidLabel')}
                            value={invalid}
                            isNumericValue
                        />
                        <TextOutput
                            className={styles.text}
                            label={_ts('components.viz.dataSeries', 'emptyLabel')}
                            value={empty}
                            isNumericValue
                        />
                    </header>
                    <MultiViewContainer
                        views={this.modalViews}
                        active={activeView}
                    />
                </ModalBody>
            </Modal>
        );
    };

    render() {
        const {
            className,
            value: {
                cache: {
                    healthStats,
                    status,
                } = {},
                type,
                title,
            },
            hideDetails,
            entryState: {
                activeView: activeViewFromState,
                activeSort = 'sortingDes',
            } = {},
        } = this.props;


        const ExpandedModal = this.renderExpandedModal;

        const options = this.getSegmentOptions(type);
        const activeView = activeViewFromState || Object.keys(options)[0];
        const showSort = (
            (activeView === GRAPH.horizontalBarChart)
            || (activeView === GRAPH.verticalBarChart)
        );

        const isPending = !status || status === 'pending';
        const isFailing = !isPending && status !== 'success';
        const disabled = isPending || isFailing;

        return (
            <div className={_cs(className, 'data-series', styles.dataSeries)}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        {title}
                    </h4>
                    { !hideDetails &&
                        <div className={styles.actions}>
                            {showSort &&
                                <RotatingInput
                                    disabled={disabled}
                                    className={styles.sortButton}
                                    rendererSelector={sortRendererSelector}
                                    keySelector={sortKeySelector}
                                    value={activeSort}
                                    onChange={this.handleSortChange}
                                    options={sortingLabels}
                                    showLabel={false}
                                    showHintAndError={false}
                                />
                            }
                            { options && Object.keys(options).length > 1 &&
                                <ScrollTabs
                                    active={activeView}
                                    className={styles.fixedTabs}
                                    onClick={this.handleSegmentStateChange}
                                    renderer={Tab}
                                    rendererParams={this.scrollTabRendererParams}
                                    tabs={options}
                                    disabled={disabled}
                                />
                            }
                            <ModalButton
                                iconName="expand"
                                className={styles.expandButton}
                                transparent
                                disabled={disabled}
                                modal={
                                    <ExpandedModal
                                        title={title}
                                        type={type}
                                        activeView={activeView}
                                        activeSort={activeSort}
                                        showSort={showSort}
                                        healthStats={healthStats}
                                    />
                                }
                            />
                        </div>
                    }
                </header>
                {!hideDetails && isPending &&
                    <div className={styles.content}>
                        <Message>
                            Data processing in progress
                        </Message>
                    </div>
                }
                {!hideDetails && isFailing &&
                    <div className={styles.content}>
                        <Message>
                            Data processing failed
                        </Message>
                    </div>
                }
                { !hideDetails && !isPending && !isFailing &&
                    <div className={styles.content}>
                        <MultiViewContainer
                            views={this.views}
                            active={activeView}
                        />
                    </div>
                }
            </div>
        );
    }
}
