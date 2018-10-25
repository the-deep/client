import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fieldId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

export default class Field extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static dataKeySelector = d => d.key;

    static calcSummarizedData = memoize((data) => {
        if (data.length <= 5) {
            return data;
        }
        const summary = data.slice(0, 5);
        return [
            ...summary,
            {
                key: 'ellipsis',
                value: '...',
            },
        ];
    })

    renderDataItem = ({ value }) => (
        <div className={styles.dataItem}>
            {value}
        </div>
    )

    renderDataParams = (key, dataItem) => ({
        ...dataItem,
    })

    render() {
        const {
            className,
            fieldId,
            title,
            type,
            data,
        } = this.props;

        return (
            <div className={_cs(className, styles.field)}>
                <h5>
                    {title}
                </h5>
                <ListView
                    className={styles.dataItems}
                    keySelector={Field.dataKeySelector}
                    rendererParams={this.renderDataParams}
                    data={Field.calcSummarizedData(data)}
                    renderer={this.renderDataItem}
                />
            </div>
        );
    }
}
