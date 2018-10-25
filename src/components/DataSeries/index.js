import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';

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

    renderTableItem = ({ value }) => (
        <div className={styles.tableItem}>
            {value}
        </div>
    )

    renderTableParams = (key, item) => ({
        ...item,
    })

    render() {
        const {
            className,
            value,
        } = this.props;

        return (
            <div className={_cs(className, 'data-series', styles.dataSeries)}>
                <h5>
                    {value.title}
                </h5>
                <ListView
                    className={styles.table}
                    keySelector={DataSeries.seriesKeySelector}
                    rendererParams={this.renderTableParams}
                    data={value.series}
                    renderer={this.renderTableItem}
                />
            </div>
        );
    }
}
