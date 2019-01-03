import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import GeoViz from '#components/geo/GeoViz';
import SegmentInput from '#rsci/SegmentInput';
import BarChart from '#rscz/BarChart';
import WordCloud from '#rscz/WordCloud';

import _cs from '#cs';
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

export default class DataSeries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static seriesKeySelector = d => d.key;
    static wordCloudFontSizeSelector = d => d.size;

    static segmentKeySelector = d => d.key;
    static segmentLabelSelector = d => d.label;

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
        string: ['table', 'wordCloud'],
        number: ['table', 'barChart', 'vBarChart', 'wordCloud'],
        datetime: ['table'],
        geo: ['table', 'geo'],
    }

    static modesLabel = {
        table: 'Table',
        barChart: 'Bar Chart',
        vBarChart: 'Vertical Bar Chart',
        wordCloud: 'Word Cloud',
        geo: 'Geo',
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
            <BarChart
                className={_cs(className, styles.chart)}
                data={this.calcNumberCountSeries(value.series)}
                xKey="text"
                yKey="size"
                xTickFormat={() => ''}
                yTickFormat={() => ''}
                xGrid={false}
                yGrid={false}
            />
        ),
        vBarChart: ({ value, className }) => (
            // TODO: use V Bar chart
            <div>
                Coming Soon
            </div>
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
                    fontSizeSelector={DataSeries.wordCloudFontSizeSelector}
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
                        <SegmentInput
                            name="random-name-for-segment-1"
                            labelSelector={DataSeries.segmentLabelSelector}
                            keySelector={DataSeries.segmentSelector}
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
