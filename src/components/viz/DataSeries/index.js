import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import GeoViz from '#components/geo/GeoViz';
import RotatingInput from '#rsci/RotatingInput';
import HorizontalBar from '#rscz/HorizontalBar';
import VerticalBarChart from '#rscz/VerticalBarChart';
import WordCloud from '#rscz/WordCloud';

import _cs from '#cs';
import _ts from '#ts';
import styles from './styles.scss';

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

const chartsMargin = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
};

export default class DataSeries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static seriesKeySelector = d => d.key;
    static sizeSelector = d => d.size;
    static chartsLabelSelector = d => d.text;
    static horizontalBarTextSelector = () => '';
    static tooltipSelector = d => `<span>${d.text}</span>`;

    static rotatingInputKeySelector = d => d.key;
    static rotatingInputLabelSelector = d => d.label;

    static renderTableItem = ({ value }) => (
        <div
            className={styles.tableItem}
            title={value}
        >
            {value}
        </div>
    )

    static renderTableParams = (key, item) => ({ ...item })

    static modes = {
        string: ['table', 'barChart', 'vBarChart', 'wordCloud'],
        number: ['table', 'barChart', 'vBarChart', 'wordCloud'],
        datetime: ['table'],
        geo: ['table', 'geo'],
    }

    static modesLabel = {
        table: <span>{_ts('components.viz.dataSeries', 'tableVizLabel')}</span>,
        barChart: <span>{_ts('components.viz.dataSeries', 'barChartVizLabel')}</span>,
        vBarChart: <span>{_ts('components.viz.dataSeries', 'vBarChartVizLabel')}</span>,
        wordCloud: <span>{_ts('components.viz.dataSeries', 'wordCloudVizLabel')}</span>,
        geo: <span>{_ts('components.viz.dataSeries', 'geoVizLabel')}</span>,
    }

    state = {
        mode: 'table',
    }

    getSegmentOptions = memoize(type => (
        DataSeries.modes[type].map(
            mode => ({
                key: mode,
                label: DataSeries.modesLabel[mode],
            }),
        )
    ))

    previewComponents = {
        table: ({ value, className }) => (
            <ListView
                className={_cs(className, styles.table)}
                keySelector={DataSeries.seriesKeySelector}
                rendererParams={DataSeries.renderTableParams}
                renderer={DataSeries.renderTableItem}
                data={value.series}
            />
        ),
        barChart: ({ value, className }) => (
            <HorizontalBar
                className={_cs(className, styles.chart)}
                data={this.calcNumberCountSeries(value.series)}
                valueSelector={DataSeries.sizeSelector}
                valueLabelFormat={DataSeries.horizontalBarTextSelector}
                labelSelector={DataSeries.chartsLabelSelector}
                tooltipContent={DataSeries.tooltipSelector}
                margins={chartsMargin}
                showTooltip
            />
        ),
        vBarChart: ({ value, className }) => (
            <VerticalBarChart
                className={_cs(className, styles.chart)}
                data={this.calcNumberCountSeries(value.series)}
                valueSelector={DataSeries.sizeSelector}
                labelSelector={DataSeries.chartsLabelSelector}
                tooltipContent={DataSeries.tooltipSelector}
                margins={chartsMargin}
                showTooltip
            />
        ),
        geo: ({ value: { geodata }, className }) => (
            <GeoViz
                className={className}
                regions={geodata.regions}
                value={this.calcGeoValue(geodata)}
            />
        ),
        wordCloud: ({ value, className }) => {
            const data = this.calcWordCountSeries(value.series);
            return (
                <WordCloud
                    className={className}
                    data={data}
                    fontSizeSelector={DataSeries.sizeSelector}
                />
            );
        },
    }

    calcWordCountSeries = memoize((series) => {
        const tags = series.reduce(
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

    calcNumberCountSeries = memoize((series) => {
        const tags = series.reduce(
            (acc, { value }) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {},
        );
        return Object.keys(tags).map(word => ({
            text: word,
            size: tags[word],
        }));
    })

    calcNumberSeries = memoize(series => series.map((item, index) => ({
        key: index,
        value: parseFloat(item.value),
    })))

    calcGeoValue = memoize(geodata => geodata.data.map(d => String(d.selectedId)))

    handleSegmentStateChange = (mode) => {
        this.setState({ mode });
    }

    render() {
        const {
            className,
            value,
        } = this.props;
        const { mode } = this.state;

        const PreviewComponent = this.previewComponents[mode];

        return (
            <div className={_cs(className, 'data-series', styles.dataSeries)}>
                <header>
                    <h5>
                        {value.title}
                    </h5>
                    <div>
                        <RotatingInput
                            rendererSelector={DataSeries.rotatingInputLabelSelector}
                            keySelector={DataSeries.rotatingInputKeySelector}
                            value={mode}
                            onChange={this.handleSegmentStateChange}
                            options={this.getSegmentOptions(value.type)}
                        />
                    </div>
                </header>
                <PreviewComponent
                    className={styles.preview}
                    value={value}
                />
            </div>
        );
    }
}
