import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import Button from '#rsca/Button';

import ListView from '#rscv/List/ListView';
import SparkLines from '#rscz/SparkLines';
import GeoViz from '#components/geo/GeoViz';

import { iconNames } from '#constants';

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
        string: ['table'],
        number: ['table', 'line'],
        datetime: ['table'],
        geo: ['table', 'geo'],
    }

    state = {
        mode: 'table',
    }

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
        line: ({ value, className }) => (
            <SparkLines
                className={_cs(className, styles.chart)}
                data={this.calcNumberSeries(value.series)}
                yValueSelector={d => d.value}
                xValueSelector={d => d.key}
                yLabelModifier={y => y}
                xLabelModifier={x => `At position ${x}`}
                showTooltip={false}
                fill
            />
        ),
        geo: ({ value: { geodata }, className }) => (
            <GeoViz
                className={className}
                regions={geodata.regions}
                value={this.calcGeoValue(geodata)}
            />
        ),
    }

    calcNumberSeries = memoize(series => series.map((item, index) => ({
        key: index,
        value: parseFloat(item.value),
    })))

    calcGeoValue = memoize(geodata => geodata.data.map(d => String(d.selectedId)))

    togglePreview = () => {
        const { mode } = this.state;
        const candidates = DataSeries.modes[this.props.value.type];
        const index = candidates.indexOf(mode);
        const newIndex = (index + 1) % candidates.length;
        this.setState({
            mode: candidates[newIndex],
        });
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
                        <Button
                            onClick={this.togglePreview}
                            iconName={iconNames.swap}
                            transparent
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
